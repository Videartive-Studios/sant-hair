import type { APIRoute } from 'astro';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createToken,
} from '@/lib/auth';
import { clientKey, rateLimit, resetRateLimit, tooManyRequests } from '@/lib/rate-limit';

export const prerender = false;

/** Intentos fallidos permitidos antes de bloquear. */
const LIMITE_LOGIN = 5;
/** Ventana de bloqueo: 15 minutos. */
const VENTANA_MS = 15 * 60 * 1000;

export const POST: APIRoute = async ({ request, cookies }) => {
  const key = clientKey(request);

  try {
    const body = await request.json();
    const password = String(body?.password ?? '');

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Escribe la contraseña.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!checkPassword(password)) {
      // Solo cuentan los intentos fallidos: un administrador que se equivoca
      // varias veces no deberia quedarse fuera si acierta a continuacion.
      const limit = rateLimit('login', key, LIMITE_LOGIN, VENTANA_MS);
      if (!limit.ok) return tooManyRequests(limit.retryAfter);

      await new Promise((r) => setTimeout(r, 400));
      return new Response(
        JSON.stringify({ error: 'Contraseña incorrecta.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Login correcto: se libera el limite para ese cliente.
    resetRateLimit('login', key);

    cookies.set(ADMIN_COOKIE, createToken(), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: import.meta.env.PROD,
      maxAge: SESSION_MAX_AGE,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/admin/login]', err);
    return new Response(
      JSON.stringify({ error: 'No se pudo iniciar sesión.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
