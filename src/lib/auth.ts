/**
 * Autenticacion del panel de administracion.
 *
 * La contrasena y el secreto de firma se leen de variables de entorno:
 * ADMIN_PASSWORD -> contrasena de acceso al panel
 * ADMIN_SECRET -> clave para firmar las cookies de sesion
 *
 * Si ADMIN_PASSWORD no esta definida, el panel queda deshabilitado.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'sh_admin';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

const FALLBACK_SECRET = 'santhair-cambia-este-secreto-en-produccion';

/**
 * Lee una variable de entorno tanto desde `process env` (produccion en
 * Netlify) como desde `import.meta env` (archivos.env en desarrollo).
 */
export function env(name: string): string | undefined {
  const fromImportMeta = (import.meta as unknown as { env?: Record<string, string> })
.env?.[name];
  if (fromImportMeta) return fromImportMeta;
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

function secret(): string {
  return env('ADMIN_SECRET') || FALLBACK_SECRET;
}

export function adminEnabled(): boolean {
  return !!env('ADMIN_PASSWORD');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compara longitudes sin filtrar informacion y luego da false.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(password: string): boolean {
  const expected = env('ADMIN_PASSWORD');
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function createToken(payload = 'admin'): string {
  const ts = Date.now().toString(36);
  const nonce = randomBytes(6).toString('base64url');
  const body = `${payload}.${ts}.${nonce}`;
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [payload, ts, nonce, sig] = parts;
  const body = `${payload}.${ts}.${nonce}`;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');

  if (!safeEqual(sig, expected)) return false;

  const tsNumber = parseInt(ts, 36);
  if (!Number.isFinite(tsNumber)) return false;
  return Date.now() - tsNumber < SESSION_MAX_AGE * 1000;
}
