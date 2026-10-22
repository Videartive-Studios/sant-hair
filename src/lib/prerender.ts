/**
 * Modo de renderizado de las rutas que necesitan el servidor.
 *
 * Astro decide si una ruta se prerenderiza leyendo su codigo fuente con una
 * expresion regular que solo reconoce los literales `true` y `false`:
 *
 *   /^\s*export\s+const\s+prerender\s*=\s*(true|false);?/m
 *
 * Por eso estas rutas no declaran `export const prerender = false` de forma
 * literal, sino que reexportan el valor de aqui. Asi, el comportamiento real
 * lo decide el modo de compilacion:
 *
 * - Sitio real (Netlify, `output: 'server'`): por defecto Astro sirve todo en
 *   el servidor, que es justo lo que necesitan estas rutas.
 * - Vista previa (GitHub Pages, `output: 'static'`): por defecto Astro
 *   prerenderiza, y la ruta se convierte en un archivo estatico.
 *
 * Reexportar (y no escribir el literal) es lo que permite que el mismo
 * codigo compile en los dos modos.
 */
export const prerender = false;
