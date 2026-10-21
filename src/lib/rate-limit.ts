/**
 * Limitador de peticiones en memoria.
 *
 * Cada instancia de la función de Netlify tiene su propio espacio de memoria,
 * asi que este limite protege cada instancia por separado. Es suficiente para
 * frenar rafagas y ataques de fuerza bruta automatizados; para limites
 * globales habria que usar un almacen compartido (por ejemplo Netlify Blobs).
 *
 * La clave incluye la IP del cliente y el ambito, de modo que un mismo
 * endpoint no puede saltarse el limite cambiando de accion.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** Limpia las entradas caducadas para que el mapa no crezca sin limite. */
function sweep(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Segundos que hay que esperar antes de reintentar. */
  retryAfter: number;
  limit: number;
};

/**
 * Registra un intento y dice si se permite continuar.
 *
 * @param scope  Ambito logico ("login", "contacto", "newsletter"...).
 * @param id     Identificador del cliente (normalmente la IP).
 * @param limit  Intentos permitidos dentro de la ventana.
 * @param windowMs  Duracion de la ventana en milisegundos.
 */
export function rateLimit(
  scope: string,
  id: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const key = `${scope}:${id}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0, limit };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { ok: false, remaining: 0, retryAfter, limit };
  }

  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfter: 0,
    limit,
  };
}

/** Libera el limite de un ambito (se usa tras un login correcto). */
export function resetRateLimit(scope: string, id: string) {
  buckets.delete(`${scope}:${id}`);
}

/**
 * Obtiene la direccion IP del cliente.
 * Netlify envia `x-nf-client-connection-ip`; en desarrollo local cae al
 * user agent para que el limite siga distinguiendo algunas peticiones.
 */
export function clientKey(request: Request): string {
  const headers = request.headers;
  const ip =
    headers.get('x-nf-client-connection-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip');
  if (ip) return ip;
  return headers.get('user-agent')?.slice(0, 64) ?? 'desconocido';
}

/** Respuesta 429 estandar con cabecera `Retry-After`. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  );
}
