import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// En desarrollo, Vite inyecta los estilos y los scripts en linea y Astro no
// puede calcular sus hashes, asi que la politica es mas permisiva. La que se
// aplica de verdad es la de produccion, que va con los hashes calculados.
const esDev = process.env.NODE_ENV !== 'production';

// Modo vista previa: build ESTATICO para GitHub Pages.
//
// GitHub Pages solo sirve archivos estaticos: no ejecuta funciones ni API
// routes. Para publicar una vista previa de cada PR se compila el sitio como
// estatico (sin adaptador), tomando el catalogo de la semilla del codigo.
//
// En este modo no hay backend, asi que las rutas que lo necesitan (API de
// checkout, contacto y newsletter, panel de administracion) se desactivan con
// `PREVIEW_BUILD=1`. El sitio real sigue saliendo de Netlify, sin cambios.
const vistaPrevia = process.env.PREVIEW_BUILD === '1';

// https://astro build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://santhair.com',
  // GitHub Pages sirve el proyecto en `/sant-hair/` y cada PR en su propia
  // carpeta (`/sant-hair/pr-12/`), de modo que la base cambia por build.
  base: process.env.BASE_PATH ?? '/',
  output: vistaPrevia ? 'static' : 'server',
  adapter: vistaPrevia
    ? undefined
    : netlify({
        // En `astro dev` la emulacion de Edge Functions levanta un servidor extra
        // que no es necesario para este proyecto (no usamos middleware edge).
        devFeatures: {
          edgeFunctions: false,
          images: false,
          environmentVariables: false,
        },
        // Con `staticHeaders` el adaptador escribe la cabecera CSP (y el resto de
        // cabeceras estaticas) en la configuracion de Netlify, de modo que se
        // aplican tambien a los archivos prerenderizados.
        staticHeaders: true,
      }),
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
  // Politica de seguridad de contenido.
  //
  // En produccion, Astro calcula el hash SHA-256 de los scripts en linea y
  // los anade a la cabecera, asi que no hace falta 'unsafe-inline' para los
  // scripts. Los estilos en linea (los atributos `style` de los componentes)
  // si se permiten de forma explicita, porque se usan a menudo en el
  // diseno y anadir un hash por cada uno no es practico.
  //
  // La cabecera la emite el propio Astro en cada respuesta, con lo que el
  // sitio no depende de la configuracion de Netlify para protegerse.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "connect-src 'self'",
        "font-src 'self' data:",
        "img-src 'self' data: https:",
        "manifest-src 'self'",
        "upgrade-insecure-requests",
      ],
      // Astro exige que `script-src` y `style-src` se declaren aqui, con
      // sus recursos y sus hashes.
      scriptDirective: {
        resources: esDev
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
          : ["'self'"],
      },
      styleDirective: {
        resources: [
          ...(esDev ? ["'self'", "'unsafe-inline'"] : ["'self'"]),
          // Los atributos `style` en linea se usan a menudo en el diseno: se
          // permiten de forma explicita en vez de calcular un hash por cada uno.
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
  vite: {
    ssr: {
      noExternal: ['@netlify/blobs'],
    },
  },
});
