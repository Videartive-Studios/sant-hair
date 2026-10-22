import type { APIRoute } from 'astro';
import { subscribe } from '@/db/repo';
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export { prerender } from '@/lib/prerender';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITE_NEWSLETTER = 10;
const VENTANA_MS = 60 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const limit = rateLimit(
    'newsletter',
    clientKey(request),
    LIMITE_NEWSLETTER,
    VENTANA_MS,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();
    const email = String(body?.email ?? '')
      .trim()
      .toLowerCase()
      .slice(0, 160);
    const nombre = body?.nombre ? String(body.nombre).trim().slice(0, 120) : undefined;

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Escribe un correo electrónico válido.' }),
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
      JSON.stringify({ error: 'No se pudo completar la suscripción.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
