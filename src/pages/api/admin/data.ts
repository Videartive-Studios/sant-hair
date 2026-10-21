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

export const prerender = false;

const STATUSES: OrderStatus[] = [
  'pendiente',
  'pagado',
  'enviado',
  'entregado',
  'cancelado',
];

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

  try {
    const body = await request.json();

    if (body?.accion === 'estado-pedido') {
      const id = String(body.id ?? '');
      const status = String(body.status ?? '') as OrderStatus;
      if (!STATUSES.includes(status)) {
        return json({ error: 'Estado no valido' }, 400);
      }
      const order = await updateOrderStatus(id, status);
      if (!order) return json({ error: 'Pedido no encontrado' }, 404);
      return json({ ok: true, order });
    }

    if (body?.accion === 'actualizar-producto') {
      const slug = String(body.slug ?? '');
      const patch: Record<string, unknown> = {};

      if (body.price !== undefined) patch.price = Math.max(0, Number(body.price));
      if (body.stock !== undefined) patch.stock = Math.max(0, Number(body.stock));
      if (body.compareAtPrice !== undefined) {
        patch.compareAtPrice = Number(body.compareAtPrice);
      }
      if (body.published !== undefined) patch.published = Boolean(body.published);
      if (body.badge !== undefined) patch.badge = String(body.badge);

      const product = await updateProduct(slug, patch);
      if (!product) return json({ error: 'Producto no encontrado' }, 404);
      return json({ ok: true, product });
    }

    return json({ error: 'Accion desconocida' }, 400);
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
