import type { APIRoute } from 'astro';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createToken,
} from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const password = String(body?.password ?? '');

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Escribe la contrasena.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!checkPassword(password)) {
      await new Promise((r) => setTimeout(r, 400));
      return new Response(
        JSON.stringify({ error: 'Contrasena incorrecta.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

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
      JSON.stringify({ error: 'No se pudo iniciar sesion.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
