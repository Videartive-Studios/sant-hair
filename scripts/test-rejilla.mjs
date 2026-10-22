// Comprueba cuantas columnas tiene la rejilla de la tienda en distintos
// anchos de pantalla y si un unico producto deja las demas columnas vacias.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9225;

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PUERTO}`,
  '--window-size=1440,900',
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

const ANCHOS = [1600, 1440, 1280, 1100, 1000, 900, 800, 640, 480, 375];
const PAGINAS = [
  ['todos', 'http://127.0.0.1:4321/tienda'],
  ['shampoos', 'http://127.0.0.1:4321/tienda?categoria=shampoos'],
];

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
  await enviar(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  });

  const evaluar = async (expression) => {
    const r = await enviar(ws, 'Runtime.evaluate', { expression, returnByValue: true });
    return r.result.value;
  };

  for (const [nombre, url] of PAGINAS) {
    console.log(`\n=== ${nombre} ===`);
    for (const ancho of ANCHOS) {
      await enviar(ws, 'Emulation.setDeviceMetricsOverride', {
        width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700,
      });
      await enviar(ws, 'Page.navigate', { url });
      await sleep(900);
      const r = await evaluar(`(() => {
        const g = document.querySelector('.product-grid');
        if (!g) return { error: 'sin rejilla' };
        const cs = getComputedStyle(g);
        const tarjetas = [...g.querySelectorAll('.product-card')];
        const rects = tarjetas.map((t) => Math.round(t.getBoundingClientRect().width));
        const c = g.getBoundingClientRect();
        return {
          columnas: cs.gridTemplateColumns.split(' ').length,
          plantilla: cs.gridTemplateColumns,
          tarjetas: tarjetas.length,
          anchos: rects,
          anchoRejilla: Math.round(c.width),
        };
      })()`);
      const cols = r.columnas ?? '?';
      console.log(
        `${String(ancho).padStart(5)}px  columnas=${cols}  tarjetas=${r.tarjetas ?? '?'}  ` +
        `anchoTarjeta=${r.anchos ? r.anchos.join(',') : '?'}  anchoRejilla=${r.anchoRejilla ?? '?'}`,
      );
    }
  }

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error('FALLO:', e.message);
  chrome.kill();
  process.exit(1);
});
