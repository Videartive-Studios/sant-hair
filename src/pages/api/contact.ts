import type { APIRoute } from 'astro';
import { newId, saveMessage } from '@/db/repo';
import { clientKey, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export { prerender } from '@/lib/prerender';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ASUNTOS = [
  'Consulta general',
  'Estado de mi pedido',
  'Asesoria de rutina',
  'Cambios y devoluciones',
  'Distribucion y mayorista',
];

const LIMITE_CONTACTO = 5;
const VENTANA_MS = 60 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const limit = rateLimit(
    'contacto',
    clientKey(request),
    LIMITE_CONTACTO,
    VENTANA_MS,
  );
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();

    const nombre = String(body?.nombre ?? '').trim().slice(0, 120);
    const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 160);
    const telefono = String(body?.telefono ?? '')
      .trim()
      .slice(0, 40);
    const asunto = String(body?.asunto ?? 'Consulta general').trim();
    const mensaje = String(body?.mensaje ?? '')
      .trim()
      .slice(0, 4000);

    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ error: 'Completa nombre, correo y mensaje.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico no es válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Solo se aceptan los asuntos que ofrece el formulario.
    const asuntoFinal = ASUNTOS.includes(asunto) ? asunto : 'Consulta general';

    const message = await saveMessage({
      id: newId('MSG'),
      createdAt: new Date().toISOString(),
      nombre,
      email,
      telefono: telefono || undefined,
      asunto: asuntoFinal,
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
