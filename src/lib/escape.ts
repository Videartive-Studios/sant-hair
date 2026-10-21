/**
 * Utilidades de escapado para el HTML generado en el cliente.
 *
 * El carrito vive en `localStorage`, asi que cualquiera puede editar sus
 * campos a mano. Antes de inyectar ese contenido con `innerHTML` hay que
 * escaparlo, o un `<img src=x onerror=...>` inyectado en el almacen local
 * terminaria ejecutandose en el navegador.
 */

/** Escapa los cinco caracteres que tienen significado en HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char] as string,
  );
}

/**
 * Valida que una ruta de imagen sea interna y termine en un formato de
 * imagen conocido. Evita que un `javascript:` o una URL externa entre en el
 * atributo `src`.
 */
export function safeImageSrc(value: unknown): string {
  const src = String(value ?? '').trim();
  if (!src.startsWith('/img/')) return '';
  if (!/\.(webp|png|jpe?g|avif|gif|svg)$/i.test(src)) return '';
  return escapeHtml(src);
}

/** Escapa un valor para usarlo dentro de un atributo de enlace. */
export function safeHref(value: unknown): string {
  const href = String(value ?? '').trim();
  if (href.startsWith('/')) return escapeHtml(href);
  if (/^https:\/\//i.test(href)) return escapeHtml(href);
  return '#';
}
