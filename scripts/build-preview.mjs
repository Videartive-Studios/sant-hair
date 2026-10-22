/**
 * Compila la vista previa estatica para GitHub Pages.
 *
 * GitHub Pages solo sirve archivos estaticos, asi que la vista previa se
 * compila en modo `static` (sin adaptador) en lugar del modo `server` que usa
 * Netlify. El sitio real no se ve afectado: son compilaciones distintas.
 *
 * Variables de entorno (todas opcionales):
 *
 *   PREVIEW_PATH  Carpeta donde se publica la vista previa dentro del
 *                 proyecto de GitHub Pages. Por defecto `/pr-local/`.
 *   BASE_PATH     Prefijo de las rutas del sitio. Por defecto, PREVIEW_PATH.
 *   SITE_URL      URL publica de la vista previa.
 *
 * Ejemplo:
 *
 *   PREVIEW_PATH=/pr-42/ SITE_URL=https://videartive-studios.github.io/sant-hair/pr-42/ \
 *     node scripts/build-preview.mjs
 */

import { spawnSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const previewPath = process.env.PREVIEW_PATH ?? '/pr-local/';
const basePath = process.env.BASE_PATH ?? previewPath;
const siteUrl =
  process.env.SITE_URL ??
  `https://videartive-studios.github.io/sant-hair${previewPath}`;

const entorno = {
  ...process.env,
  PREVIEW_BUILD: '1',
  PUBLIC_PREVIEW: '1',
  BASE_PATH: basePath,
  SITE_URL: siteUrl,
};

console.log(`Vista previa: ${siteUrl}  (base: ${basePath})`);

// Se llama al CLI de Astro con el propio Node: funciona igual en Windows,
// Linux y macOS, sin depender de como se resuelven los ejecutables `.cmd`.
const cli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

const resultado = spawnSync(process.execPath, [cli, 'build'], {
  env: entorno,
  stdio: 'inherit',
});

if (resultado.status !== 0) {
  console.error('El build de la vista previa fallo.');
  process.exit(resultado.status ?? 1);
}

// En modo estatico Astro deja un archivo por ruta de API (la pagina de
// error). No sirven de nada en la vista previa, donde no hay API, y solo
// confunden: se borran.
const apiDist = 'dist/api';
if (existsSync(apiDist)) {
  rmSync(apiDist, { recursive: true, force: true });
  console.log('Se eliminaron las rutas de API del build estatico.');
}

console.log('Listo: la vista previa esta en dist/');
