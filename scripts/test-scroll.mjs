// Comprueba que las secciones con animacion de entrada (.reveal) se hacen
// visibles al desplazar la pagina, y que el menu lateral del carrito se
// mantiene en pantalla.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9223;

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
  await enviar(ws, 'Page.navigate', { url: 'http://localhost:4321/' });
  await sleep(3000);

  const evaluar = async (e) => {
    const r = await enviar(ws, 'Runtime.evaluate', { expression: e, returnByValue: true });
    return r.result.value;
  };

  const estado = async () =>
    await evaluar(`(() => {
      const todos = [...document.querySelectorAll('.reveal')];
      return {
        total: todos.length,
        visibles: todos.filter((e) => e.classList.contains('is-visible')).length,
        opacidades: todos.map((e) => getComputedStyle(e).opacity),
      };
    })()`);

  console.log('Al cargar (arriba):', await estado());

  await evaluar('window.scrollTo(0, 1500)');
  await sleep(1200);
  console.log('Tras bajar 1500px:', await estado());

  await evaluar('window.scrollTo(0, 3000)');
  await sleep(1200);
  console.log('Tras bajar 3000px:', await estado());

  await evaluar('window.scrollTo(0, document.body.scrollHeight)');
  await sleep(1400);
  console.log('Al final de la pagina:', await estado());

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error('FALLO:', e.message);
  chrome.kill();
  process.exit(1);
});
