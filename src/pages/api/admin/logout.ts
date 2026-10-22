import type { APIRoute } from 'astro';
import { ADMIN_COOKIE } from '@/lib/auth';

export { prerender } from '@/lib/prerender';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(ADMIN_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
