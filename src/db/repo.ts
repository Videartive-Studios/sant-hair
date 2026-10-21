/**
 * Repositorio de datos: catalogo, pedidos, suscriptores y mensajes.
 * La semilla (src/data/catalog ts) se carga solo la primera vez; despues
 * la base de datos es la fuente de verdad y se puede editar desde /admin.
 */

import { CATEGORIES, PRODUCTS, type Category, type Product } from '@/data/catalog';
import { kvGet, kvSet, kvListAll, storageMode } from './blobs';
import { randomBytes } from 'node:crypto';

const CATALOG_KEY = 'catalogo/productos';
const CATEGORIES_KEY = 'catalogo/categorias';

export type OrderStatus =
  | 'pendiente'
  | 'pagado'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  size: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    notas?: string;
  };
  items: OrderItem[];
  subtotal: number;
  /** Descuento aplicado por cupon (0 si no hay). */
  descuento: number;
  /** Codigo del cupon aplicado, si lo hubo. */
  codigoDescuento?: string;
  shipping: number;
  total: number;
  currency: string;
  metodoPago: string;
};

export type Subscriber = {
  email: string;
  nombre?: string;
  createdAt: string;
  origen: string;
};

export type Message = {
  id: string;
  createdAt: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
};

const slugify = (value: string) =>
  value
.toLowerCase()
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');

const emailKey = (email: string) => slugify(email);

/* ------------------------------------------------------------------ */
/* Catalogo */
/* ------------------------------------------------------------------ */

export async function getProducts(): Promise<Product[]> {
  const stored = await kvGet<Product[]>(CATALOG_KEY);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    await kvSet(CATALOG_KEY, PRODUCTS);
    return PRODUCTS;
  }
  // La base de datos manda: los productos guardados mandan sobre la semilla.
  // La semilla solo aporta los campos que todavia no esten guardados, para
  // que un producto nuevo en el codigo no desaparezca al publicarlo.
  const bySlug = new Map(stored.map((p) => [p.slug, p]));
  const merged = PRODUCTS.map((seed) => {
    const saved = bySlug.get(seed.slug);
    bySlug.delete(seed.slug);
    return saved ? { ...seed, ...saved } : seed;
  });
  // Productos que solo existen en la base de datos (creados desde el panel).
  const soloEnBd = [...bySlug.values()];
  return [...merged, ...soloEnBd];
}

export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.published !== false);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function updateProduct(
  slug: string,
  patch: Partial<
    Pick<Product, 'price' | 'compareAtPrice' | 'stock' | 'published' | 'badge'>
  >,
): Promise<Product | undefined> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.slug === slug);
  if (index === -1) return undefined;
  const updated: Product = {...products[index],...patch };
  products[index] = updated;
  await kvSet(CATALOG_KEY, products);
  return updated;
}

export async function getCategories(): Promise<Category[]> {
  const stored = await kvGet<Category[]>(CATEGORIES_KEY);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    await kvSet(CATEGORIES_KEY, CATEGORIES);
    return CATEGORIES;
  }
  return stored;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getPublishedProducts();
  if (!category || category === 'todos') return products;
  return products.filter((p) => p.category === category);
}

/* ------------------------------------------------------------------ */
/* Pedidos */
/* ------------------------------------------------------------------ */

export async function createOrder(order: Order): Promise<Order> {
  await kvSet(`pedidos/${order.id}`, order);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  const orders = await kvListAll<Order>('pedidos/');
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | undefined> {
  return (await kvGet<Order>(`pedidos/${id}`)) ?? undefined;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  const order = await getOrder(id);
  if (!order) return undefined;
  const updated = {...order, status };
  await kvSet(`pedidos/${id}`, updated);
  return updated;
}

/* ------------------------------------------------------------------ */
/* Suscriptores y mensajes */
/* ------------------------------------------------------------------ */

export async function subscribe(
  email: string,
  nombre?: string,
  origen = 'web',
): Promise<Subscriber> {
  const key = emailKey(email);
  const existing = await kvGet<Subscriber>(`suscriptores/${key}`);
  const subscriber: Subscriber = {
    email: email.toLowerCase(),
    nombre: nombre ?? existing?.nombre,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    origen,
  };
  await kvSet(`suscriptores/${key}`, subscriber);
  return subscriber;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const subs = await kvListAll<Subscriber>('suscriptores/');
  return subs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveMessage(message: Message): Promise<Message> {
  await kvSet(`mensajes/${message.id}`, message);
  return message;
}

export async function getMessages(): Promise<Message[]> {
  const msgs = await kvListAll<Message>('mensajes/');
  return msgs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------------------------------------------ */
/* Utilidades */
/* ------------------------------------------------------------------ */

export function newId(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  // 6 bytes aleatorios en hexadecimal: 16^12 combinaciones, de modo que un
  // identificador de pedido no sea adivinable por fuerza bruta.
  const rand = randomBytes(6).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export const dbInfo = () => ({
  modo: storageMode,
  etiqueta:
    storageMode === 'netlify-blobs'
      ? 'Netlify Blobs (produccion)'
: 'Archivo local .data/kv.json (desarrollo)',
});
