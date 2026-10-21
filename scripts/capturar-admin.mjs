// Captura el panel de administracion ya autenticado: inicia sesion con la
// contrasena local y abre el panel con la cookie en el navegador.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9225;
const SALIDA =
  process.argv[2] ??
  'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\admin.png';
const BASE = process.argv[3] ?? 'http://localhost:4321';

const respuesta = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'pruebalocal123' }),
});
const clave = respuesta.headers.get('set-cookie');

if (!clave) {
  console.error('No se pudo iniciar sesion');
  process.exit(1);
}
const cookie = clave.split(';')[0];
console.log('sesion iniciada');

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PUERTO}`,
  '--window-size=1440,1600',
  'about:blank',
], { stdio: 'ignore' });

let id = 0;
const pendientes = new Map();

function enviar(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const mensajeId = ++id;
    pendientes.set(mensajeId, { resolve, reject });
    ws.send(JSON.stringify({ id: mensajeId, method, params }));
  });
}

await sleep(2500);
const lista = await (
  await fetch(`http://127.0.0.1:${PUERTO}/json/list`)
).json();
const pestana = lista.find((t) => t.type === 'page');
const ws = new WebSocket(pestana.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  if (d.id && pendientes.has(d.id)) {
    const { resolve, reject } = pendientes.get(d.id);
    pendientes.delete(d.id);
    d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
  }
};

await enviar(ws, 'Page.enable');
await enviar(ws, 'Network.enable');
await enviar(ws, 'Network.setCookie', {
  name: 'sh_admin',
  value: cookie.split('=')[1],
  domain: 'localhost',
  path: '/',
});
await enviar(ws, 'Page.navigate', { url: `${BASE}/admin` });
await sleep(4000);

const captura = await enviar(ws, 'Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true,
});
writeFileSync(SALIDA, Buffer.from(captura.data, 'base64'));
console.log('captura guardada en', SALIDA);

ws.close();
chrome.kill();
