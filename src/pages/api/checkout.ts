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

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const nombre = String(body?.nombre ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const telefono = String(body?.telefono ?? '').trim();
    const direccion = String(body?.direccion ?? '').trim();
    const ciudad = String(body?.ciudad ?? '').trim();
    const notas = body?.notas ? String(body.notas).trim(): undefined;
    const metodoPago = String(body?.metodoPago ?? 'contraentrega').trim();

    if (!nombre || !email || !telefono || !direccion || !ciudad) {
      return new Response(
        JSON.stringify({ error: 'Completa todos los campos de envio.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electronico no es valido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // El cliente puede manipular el localStorage: los precios se recalculan
    // siempre contra la base de datos.
    const requested = Array.isArray(body?.items) ? body.items: [];
    if (requested.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Tu carrito esta vacio.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const catalog = await getProducts();
    const items: OrderItem[] = [];

    for (const raw of requested.slice(0, 20)) {
      const product = catalog.find((p) => p.slug === String(raw?.slug ?? ''));
      if (!product || product.published === false) continue;

      const qty = Math.max(1, Math.min(99, Number(raw?.qty) || 1));
      items.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        qty,
        image: product.image,
        size: product.size,
      });
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Los productos del carrito no estan disponibles.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping =
      subtotal >= SITE.freeShippingThreshold || subtotal === 0
        ? 0
: SITE.shippingCost;

    const order: Order = {
      id: newId('SH'),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      customer: { nombre, email, telefono, direccion, ciudad, notas },
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
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

    return new Response(JSON.stringify({ ok: true, orderId: order.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/checkout]', err);
    return new Response(
      JSON.stringify({ error: 'No se pudo registrar el pedido. Intenta de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
