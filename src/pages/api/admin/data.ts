import type { APIRoute } from 'astro';
import { ADMIN_COOKIE, verifyToken } from '@/lib/auth';
import {
  getMessages,
  getOrders,
  getProducts,
  getSubscribers,
  updateOrderStatus,
  updateProduct,
  type OrderStatus,
} from '@/db/repo';
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const prerender = false;

const STATUSES: OrderStatus[] = [
  'pendiente',
  'pagado',
  'enviado',
  'entregado',
  'cancelado',
];

/** Peticiones de escritura por minuto y cliente. */
const LIMITE_ESCRITURA = 120;
const VENTANA_MS = 60 * 1000;

export const GET: APIRoute = async ({ cookies, url }) => {
  if (!verifyToken(cookies.get(ADMIN_COOKIE)?.value)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resource = url.searchParams.get('recurso') ?? 'resumen';

  if (resource === 'pedidos') {
    return json(await getOrders());
  }
  if (resource === 'productos') {
    return json(await getProducts());
  }
  if (resource === 'suscriptores') {
    return json(await getSubscribers());
  }
  if (resource === 'mensajes') {
    return json(await getMessages());
  }

  const [orders, products, subscribers, messages] = await Promise.all([
    getOrders(),
    getProducts(),
    getSubscribers(),
    getMessages(),
  ]);

  return json({
    pedidos: orders.length,
    ingresos: orders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0),
    productos: products.length,
    stockTotal: products.reduce((sum, p) => sum + p.stock, 0),
    suscriptores: subscribers.length,
    mensajes: messages.length,
    ultimosPedidos: orders.slice(0, 5),
  });
};

export const PATCH: APIRoute = async ({ cookies, request }) => {
  if (!verifyToken(cookies.get(ADMIN_COOKIE)?.value)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limit = rateLimit(
    'admin-write',
    clientKey(request),
    LIMITE_ESCRITURA,
    VENTANA_MS,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();

    if (body?.accion === 'estado-pedido') {
      const id = String(body.id ?? '');
      const status = String(body.status ?? '') as OrderStatus;
      if (!STATUSES.includes(status)) {
        return json({ error: 'Estado no válido' }, 400);
      }
      const order = await updateOrderStatus(id, status);
      if (!order) return json({ error: 'Pedido no encontrado' }, 404);
      return json({ ok: true, order });
    }

    if (body?.accion === 'actualizar-producto') {
      const slug = String(body.slug ?? '');
      const patch: Record<string, unknown> = {};

      // `Number('')` es 0 y `Number('abc')` es NaN: sin esta comprobacion un
      // campo vacio guardaba el producto a $0.
      if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) {
          return json({ error: 'El precio no es válido' }, 400);
        }
        patch.price = Math.round(price);
      }
      if (body.stock !== undefined) {
        const stock = Number(body.stock);
        if (!Number.isFinite(stock) || stock < 0) {
          return json({ error: 'El stock no es válido' }, 400);
        }
        patch.stock = Math.round(stock);
      }
      if (body.compareAtPrice !== undefined) {
        const compare = Number(body.compareAtPrice);
        if (!Number.isFinite(compare) || compare < 0) {
          return json({ error: 'El precio de comparación no es válido' }, 400);
        }
        patch.compareAtPrice = Math.round(compare);
      }
      if (body.published !== undefined) patch.published = Boolean(body.published);
      if (body.badge !== undefined) patch.badge = String(body.badge).slice(0, 40);

      const product = await updateProduct(slug, patch);
      if (!product) return json({ error: 'Producto no encontrado' }, 404);
      return json({ ok: true, product });
    }

    return json({ error: 'Acción desconocida' }, 400);
  } catch (err) {
    console.error('[api/admin]', err);
    return json({ error: 'Error interno' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
