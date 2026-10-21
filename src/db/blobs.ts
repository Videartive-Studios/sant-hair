/**
 * Capa de persistencia.
 *
 * En produccion usa Netlify Blobs (el almacenamiento nativo de Netlify, sin
 * cuentas externas). En desarrollo local cae automaticamente a un archivo JSON
 * en `.data/`, de modo que `npm run dev` funciona sin configuracion.
 */

import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const STORE_NAME = 'santhair';
const LOCAL_DIR = resolve(process.cwd(), '.data');
const LOCAL_FILE = join(LOCAL_DIR, 'kv json');

/** Netlify inyecta estas variables automaticamente en el entorno de Functions. */
const hasBlobs =
  !!process.env.NETLIFY_BLOBS_SITE_ID && !!process.env.NETLIFY_BLOBS_TOKEN;

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
  return getStore({ name: STORE_NAME });
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (hasBlobs) {
    try {
      const { value } = await blobsStore().get(key, { type: 'text' });
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
      await blobsStore().set(key, JSON.stringify(value), { type: 'text' });
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

/** Lista las claves que empiezan por un prefijo dado. */
export async function kvList(prefix: string): Promise<string[]> {
  if (hasBlobs) {
    try {
      const { blobs } = await blobsStore().list({ prefix });
      return blobs.map((b) => b.key);
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
  return values.filter((v): v is T => v !== null);
}
