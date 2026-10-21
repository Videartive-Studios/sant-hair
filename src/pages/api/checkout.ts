import type { APIRoute } from 'astro';
import {
  createOrder,
  getProducts,
  newId,
  updateProduct,
  type Order,
  type OrderItem,
} from '@/db/repo';
import { SITE } from '@/data/site';
import { resolvePromo } from '@/lib/promo';
import { createOrderToken } from '@/lib/order-token';
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const METODOS_PAGO = ['contraentrega', 'transferencia', 'whatsapp'] as const;

const LIMITE_CHECKOUT = 15;
const VENTANA_MS = 10 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const limit = rateLimit(
    'checkout',
    clientKey(request),
    LIMITE_CHECKOUT,
    VENTANA_MS,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();

    const nombre = String(body?.nombre ?? '').trim().slice(0, 120);
    const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 160);
    const telefono = String(body?.telefono ?? '').trim().slice(0, 40);
    const direccion = String(body?.direccion ?? '').trim().slice(0, 200);
    const ciudad = String(body?.ciudad ?? '').trim().slice(0, 120);
    const notas = body?.notas ? String(body.notas).trim().slice(0, 500) : undefined;
    const metodoPago = String(body?.metodoPago ?? 'contraentrega').trim();
    const codigo = body?.codigo ? String(body.codigo) : '';

    if (!nombre || !email || !telefono || !direccion || !ciudad) {
      return new Response(
        JSON.stringify({ error: 'Completa todos los campos de envío.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico no es válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!(METODOS_PAGO as readonly string[]).includes(metodoPago)) {
      return new Response(
        JSON.stringify({ error: 'Método de pago no válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // El cliente puede manipular el localStorage: los precios se recalculan
    // siempre contra la base de datos.
    const requested = Array.isArray(body?.items) ? body.items : [];
    if (requested.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Tu carrito está vacío.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const catalog = await getProducts();
    const items: OrderItem[] = [];
    const faltantes: string[] = [];

    for (const raw of requested.slice(0, 20)) {
      const product = catalog.find((p) => p.slug === String(raw?.slug ?? ''));
      if (!product || product.published === false) continue;

      const qty = Math.max(1, Math.min(99, Number(raw?.qty) || 1));

      // No se puede pedir mas unidades de las que hay en stock.
      if (qty > product.stock) {
        faltantes.push(
          product.stock === 0
            ? `${product.name} está agotado.`
            : `Solo quedan ${product.stock} unidades de ${product.name}.`,
        );
        continue;
      }

      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        qty,
        image: product.image,
        size: product.size,
      });
    }

    if (faltantes.length > 0) {
      return new Response(
        JSON.stringify({ error: faltantes.join(' ') }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Los productos del carrito no están disponibles.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // El cupon se valida en el servidor: el descuento nunca se acepta desde
    // el navegador.
    const promo = resolvePromo(codigo, subtotal);
    const descuento = promo?.amount ?? 0;
    const totalSinDescuento = subtotal - descuento;

    const shipping =
      totalSinDescuento >= SITE.freeShippingThreshold || totalSinDescuento === 0
        ? 0
        : SITE.shippingCost;

    const order: Order = {
      id: newId('SH'),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      customer: { nombre, email, telefono, direccion, ciudad, notas },
      items,
      subtotal,
      descuento,
      codigoDescuento: promo?.code,
      shipping,
      total: totalSinDescuento + shipping,
      currency: SITE.currency,
      metodoPago,
    };

    await createOrder(order);

    // Descuento de inventario
    for (const item of items) {
      const product = catalog.find((p) => p.slug === item.slug);
      if (product) {
        await updateProduct(item.slug, {
          stock: Math.max(0, product.stock - item.qty),
        });
      }
    }

    // El token es lo que autoriza a ver el detalle del pedido: sin el, la
    // pagina de confirmacion no muestra datos personales.
    const token = createOrderToken(order.id);

    return new Response(JSON.stringify({ ok: true, orderId: order.id, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/checkout]', err);
    return new Response(
      JSON.stringify({ error: 'No se pudo registrar el pedido. Inténtalo de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
