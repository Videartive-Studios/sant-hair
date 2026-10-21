/**
 * Tokens de acceso a un pedido.
 *
 * La pagina de confirmacion necesita mostrar los datos del pedido (correo,
 * telefono, direccion). Si basta con conocer el identificador, cualquiera
 * que adivine `SH-XXXX` veria los datos personales de otros clientes.
 *
 * La solucion: al crear el pedido se emite un token firmado con HMAC que
 * viaja en la URL. La pagina de confirmacion solo muestra el detalle si el
 * token es valido para ese pedido.
 *
 * Secreto: ORDER_TOKEN_SECRET -> ADMIN_SECRET -> clave aleatoria de proceso
 * (en desarrollo). En produccion hay que definir ORDER_TOKEN_SECRET o
 * ADMIN_SECRET: con una clave aleatoria de proceso las sesiones se rompen
 * al reiniciarse la funcion de Netlify.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './auth';

/** Validez del token de pedido: 30 dias. */
export const ORDER_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const FALLBACK_SECRET = createHmac('sha256', 'santhair-pedidos')
  .update(String(process.pid))
  .digest('hex');

function secret(): string {
  return env('ORDER_TOKEN_SECRET') || env('ADMIN_SECRET') || FALLBACK_SECRET;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Genera el token de acceso para un pedido recien creado. */
export function createOrderToken(orderId: string): string {
  const expires = Date.now() + ORDER_TOKEN_MAX_AGE * 1000;
  const body = `${orderId}.${expires.toString(36)}`;
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/**
 * Comprueba que un token pertenezca a ese pedido y no haya caducado.
 * Devuelve el identificador del pedido si es valido, `null` si no.
 */
export function verifyOrderToken(
  orderId: string,
  token: string | undefined,
): string | null {
  if (!token || !orderId) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [id, expiresRaw, sig] = parts;
  if (id !== orderId) return null;

  const body = `${id}.${expiresRaw}`;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;

  const expires = parseInt(expiresRaw, 36);
  if (!Number.isFinite(expires)) return null;
  if (Date.now() > expires) return null;

  return orderId;
}
