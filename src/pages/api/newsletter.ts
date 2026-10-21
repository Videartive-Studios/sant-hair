import type { APIRoute } from 'astro';
import { subscribe } from '@/db/repo';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const nombre = body?.nombre ? String(body.nombre).trim(): undefined;

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Escribe un correo electronico valido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const subscriber = await subscribe(email, nombre, 'newsletter');

    return new Response(JSON.stringify({ ok: true, subscriber }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/newsletter]', err);
    return new Response(
      JSON.stringify({ error: 'No se pudo completar la suscripcion.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
