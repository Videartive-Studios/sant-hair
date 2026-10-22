/**
 * Rutas internas del sitio.
 *
 * El sitio real se publica en la raiz del dominio (`https://santhair.com/`),
 * asi que el prefijo es vacio y las rutas se quedan como estan.
 *
 * La vista previa de cada PR se publica en GitHub Pages, que sirve el
 * proyecto en un subdirectorio (`/sant-hair/pr-12/`). Ahi el prefijo no es
 * vacio y todas las rutas internas necesitan ese trozo delante: sin el, un
 * enlace a `/tienda` se iria a la raiz del dominio en lugar de a la carpeta de
 * la vista previa.
 *
 * `import.meta.env.BASE_URL` lo define Astro a partir de la opcion `base` de
 * la configuracion, y Vite lo sustituye por su valor en el momento de
 * compilar, tanto en el servidor como en el navegador.
 */

/** Prefijo del sitio, sin barra final. Vacio en el sitio real. */
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Anade el prefijo del sitio a una ruta interna.
 *
 * Las rutas que no empiezan por `/` (URLs absolutas, anclas, `mailto:`) se
 * devuelven tal cual.
 */
export function url(ruta: string): string {
  if (!ruta || !ruta.startsWith('/')) return ruta;
  return `${base}${ruta}`;
}

/**
 * Quita el prefijo del sitio de una ruta.
 *
 * Sirve para comparar la URL actual con las rutas del sitio (por ejemplo, para
 * marcar el enlace activo del menu) y para construir el canonical, que nunca
 * debe llevar el prefijo de la vista previa.
 */
export function path(ruta: string): string {
  if (base && ruta.startsWith(base)) return ruta.slice(base.length) || '/';
  return ruta;
}

