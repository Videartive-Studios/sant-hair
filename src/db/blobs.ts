/**
 * Capa de persistencia.
 *
 * En producción usa Netlify Blobs (el almacenamiento nativo de Netlify, sin
 * cuentas externas). En desarrollo local cae automáticamente a un archivo JSON
 * en `.data/`, de modo que `npm run dev` funciona sin configuración.
 */

import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const STORE_NAME = 'santhair';
const LOCAL_DIR = resolve(process.cwd(), '.data');
const LOCAL_FILE = join(LOCAL_DIR, 'kv.json');

/**
 * Netlify inyecta el contexto de Blobs en `NETLIFY_BLOBS_CONTEXT` (o en
 * `globalThis.netlifyBlobsContext`): un JSON en base64 con `siteID`, `token`
 * y las URLs de la API. Las variables sueltas `NETLIFY_BLOBS_SITE_ID` /
 * `NETLIFY_BLOBS_TOKEN` son el mecanismo antiguo y el SDK v11 ya no las
 * lee, asi que no sirven para detectar el modo.
 */
type BlobsContext = {
  siteID?: string;
  token?: string;
};

function readContext(): BlobsContext | null {
  const raw =
    process.env.NETLIFY_BLOBS_CONTEXT ??
    (globalThis as { netlifyBlobsContext?: string }).netlifyBlobsContext;
  if (!raw) return null;

  try {
    const json = Buffer.from(raw, 'base64').toString('utf-8');
    return (JSON.parse(json) as BlobsContext) ?? null;
  } catch {
    return null;
  }
}

const context = readContext();

/** Hay Blobs disponible si el contexto trae credenciales, o si se pasan a mano. */
const hasBlobs = Boolean(
  (context?.siteID && context?.token) ||
    (process.env.NETLIFY_BLOBS_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN),
);

export const storageMode: 'netlify-blobs' | 'local' = hasBlobs
  ? 'netlify-blobs'
  : 'local';

export type KVRecord = Record<string, unknown>;

async function readLocal(): Promise<KVRecord> {
  try {
    const raw = await readFile(LOCAL_FILE, 'utf-8');
    return JSON.parse(raw) as KVRecord;
  } catch {
    return {};
  }
}

async function writeLocal(data: KVRecord): Promise<void> {
  await mkdir(dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function blobsStore() {
  // Cuando Netlify ya inyectó el contexto (siteID, token y las URLs de la
  // API), se deja que el SDK lo lea por su cuenta: es la unica forma de que
  // funcione el servidor local de Blobs en `astro dev`.
  // Si el sitio se ejecuta fuera de Netlify, se pasan las credenciales a mano.
  if (context?.siteID && context?.token) {
    return getStore({ name: STORE_NAME });
  }
  return getStore({
    name: STORE_NAME,
    siteID: process.env.NETLIFY_BLOBS_SITE_ID as string,
    token: process.env.NETLIFY_BLOBS_TOKEN as string,
  });
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (hasBlobs) {
    try {
      // En v11 `get` devuelve el valor directamente (string con `type: 'text'`),
      // no un objeto con la propiedad `value`.
      const value = await blobsStore().get(key, { type: 'text' });
      if (value === null || value === undefined) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      console.error(`[blobs] error leyendo "${key}"`, err);
      return null;
    }
  }
  const data = await readLocal();
  return (data[key] as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (hasBlobs) {
    try {
      // `set` no admite la opción `type`: el contenido se guarda como texto.
      await blobsStore().set(key, JSON.stringify(value));
      return;
    } catch (err) {
      console.error(`[blobs] error escribiendo "${key}"`, err);
      throw err;
    }
  }
  const data = await readLocal();
  data[key] = value;
  await writeLocal(data);
}

export async function kvDelete(key: string): Promise<void> {
  if (hasBlobs) {
    await blobsStore().delete(key);
    return;
  }
  const data = await readLocal();
  delete data[key];
  await writeLocal(data);
}

/**
 * Lista las claves que empiezan por un prefijo dado.
 * Recorre todas las paginas: el SDK no pagina solo, asi que sin este bucle
 * los pedidos por encima del limite de pagina desaparecerian del panel.
 */
export async function kvList(prefix: string): Promise<string[]> {
  if (hasBlobs) {
    const keys: string[] = [];
    try {
      for await (const page of blobsStore().list({ prefix, paginate: true })) {
        for (const blob of page.blobs) keys.push(blob.key);
      }
      return keys;
    } catch (err) {
      console.error(`[blobs] error listando "${prefix}"`, err);
      return [];
    }
  }
  const data = await readLocal();
  return Object.keys(data).filter((k) => k.startsWith(prefix));
}

/** Lee todas las claves de un prefijo y devuelve su contenido. */
export async function kvListAll<T>(prefix: string): Promise<T[]> {
  const keys = await kvList(prefix);
  const values = await Promise.all(keys.map((k) => kvGet<T>(k)));
  return values.filter((v): v is Awaited<T> => v !== null && v !== undefined);
}
