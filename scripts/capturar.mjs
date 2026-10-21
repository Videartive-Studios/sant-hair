// Captura de la portada completa: primero recorre la pagina para disparar
// las animaciones de entrada y despues toma la captura.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9224;
const SALIDA = process.argv[2] ?? 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\shots\\pagina.png';
const RUTA = process.argv[3] ?? 'http://localhost:4321/';
const ALTO = Number(process.argv[4] ?? 5000);

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PUERTO}`,
  `--window-size=1440,${ALTO}`,
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

async function main() {
  await sleep(2500);
  const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json();
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
  await enviar(ws, 'Runtime.enable');
  await enviar(ws, 'Page.navigate', { url: RUTA });
  await sleep(3000);

  // Recorrer la pagina para disparar las animaciones
  const evaluar = async (e) => {
    const r = await enviar(ws, 'Runtime.evaluate', { expression: e, returnByValue: true });
    return r.result.value;
  };

  const alto = await evaluar('document.body.scrollHeight');
  for (let y = 0; y < alto; y += 700) {
    await evaluar(`window.scrollTo(0, ${y})`);
    await sleep(260);
  }
  await evaluar('window.scrollTo(0, 0)');
  await sleep(1400);

  const captura = await enviar(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  });
  writeFileSync(SALIDA, Buffer.from(captura.data, 'base64'));
  console.log('captura guardada en', SALIDA);

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error('FALLO:', e.message);
  chrome.kill();
  process.exit(1);
});
