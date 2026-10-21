import type { APIRoute } from 'astro';
import { newId, saveMessage } from '@/db/repo';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const nombre = String(body?.nombre ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const telefono = String(body?.telefono ?? '').trim();
    const asunto = String(body?.asunto ?? 'Consulta general').trim();
    const mensaje = String(body?.mensaje ?? '').trim();

    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ error: 'Completa nombre, correo y mensaje.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electronico no es valido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const message = await saveMessage({
      id: newId('MSG'),
      createdAt: new Date().toISOString(),
      nombre,
      email,
      telefono: telefono || undefined,
      asunto,
      mensaje,
      leido: false,
    });

    return new Response(JSON.stringify({ ok: true, id: message.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/contact]', err);
    return new Response(
      JSON.stringify({ error: 'No se pudo enviar el mensaje.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
