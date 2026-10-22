/**
 * Version de los recursos estaticos de `public/img`.
 *
 * En Netlify, `/img/*` se sirve con `Cache-Control: public, max-age=31536000,
 * immutable`: si se cambia el contenido de una imagen sin cambiar su nombre,
 * el navegador y la CDN siguen sirviendo la version anterior (hasta un ano).
 * Como las imagenes viven en `public/` y no en `src/assets/`, Astro no les
 * pone hash en el nombre, asi que hay que romper la cache a mano.
 *
 * `img()` anade la version como parametro de consulta. Al cambiar una
 * imagen basta con subir este numero: la URL cambia y todo el mundo recibe
 * la version nueva.
 *
 * Sube el numero cada vez que cambie un archivo de `public/img`.
 */
export const ASSETS_VERSION = '2026-10-22';

/** Anade la version de assets a la ruta de una imagen de `public/img`. */
export function img(ruta: string): string {
  if (!ruta) return '';
  const separador = ruta.includes('?') ? '&' : '?';
  return `${ruta}${separador}v=${ASSETS_VERSION}`;
}
