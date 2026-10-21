// Test de interaccion real sobre el sitio local usando el protocolo CDP.
// Comprueba que el icono del carrito abre el menu lateral, que el badge
// cuenta los productos y que las animaciones de entrada se activan.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9222;
const SITIO = 'http://localhost:4321/';

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

  // Localizar la pestaña del navegador
  const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json();
  const pestana = lista.find((t) => t.type === 'page');
  if (!pestana) throw new Error('No se encontro ninguna pestana');

  const ws = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  ws.onmessage = (event) => {
    const datos = JSON.parse(event.data);
    if (datos.id && pendientes.has(datos.id)) {
      const { resolve, reject } = pendientes.get(datos.id);
      pendientes.delete(datos.id);
      datos.error ? reject(new Error(JSON.stringify(datos.error))) : resolve(datos.result);
    }
  };

  await enviar(ws, 'Page.enable');
  await enviar(ws, 'Runtime.enable');

  // Recoger los errores de consola
  const errores = [];
  ws.addEventListener('message', (event) => {
    const datos = JSON.parse(event.data);
    if (datos.method === 'Runtime.exceptionThrown') {
      errores.push(datos.params.exceptionDetails.text + ' ' +
        (datos.params.exceptionDetails.exception?.description ?? ''));
    }
  });

  await enviar(ws, 'Page.navigate', { url: SITIO });
  await sleep(3500);

  const evaluar = async (expresion) => {
    const r = await enviar(ws, 'Runtime.evaluate', {
      expression: expresion,
      returnByValue: true,
      awaitPromise: true,
    });
    return r.result.value;
  };

  console.log('== Estado inicial ==');
  console.log('  drawer abierto:',
    await evaluar(`document.querySelector('[data-cart-drawer]').classList.contains('is-open')`));
  console.log('  badge:', await evaluar(`document.querySelector('[data-cart-count]').textContent`));

  // 1) Anadir un producto al carrito
  console.log('\n== Anadir al carrito ==');
  console.log('  clic en "Agregar al carrito":',
    await evaluar(`(() => {
      const btn = document.querySelector('[data-add-to-cart]');
      if (!btn) return 'sin boton';
      btn.click();
      return 'ok';
    })()`));
  await sleep(900);

  console.log('  drawer abierto:',
    await evaluar(`document.querySelector('[data-cart-drawer]').classList.contains('is-open')`));
  console.log('  badge:', await evaluar(`document.querySelector('[data-cart-count]').textContent`));
  console.log('  lineas en el panel:',
    await evaluar(`document.querySelectorAll('[data-cart-body] .cart-line').length`));
  console.log('  total en el pie:',
    await evaluar(`document.querySelector('[data-cart-foot]').textContent.replace(/\\s+/g,' ').trim().slice(0,90)`));

  // 2) Cerrar el menu lateral
  console.log('\n== Cerrar el menu lateral ==');
  console.log('  clic en cerrar:',
    await evaluar(`(() => {
      const btn = document.querySelector('[data-cart-close]');
      if (!btn) return 'sin boton';
      btn.click();
      return 'ok';
    })()`));
  await sleep(700);
  console.log('  drawer abierto:',
    await evaluar(`document.querySelector('[data-cart-drawer]').classList.contains('is-open')`));

  // 3) Volver a abrirlo desde el icono de la cabecera
  console.log('\n== Abrir desde el icono de la cabecera ==');
  console.log('  clic en el icono:',
    await evaluar(`(() => {
      const btn = document.querySelector('[data-cart-open]');
      if (!btn) return 'sin boton';
      btn.click();
      return 'ok';
    })()`));
  await sleep(700);
  console.log('  drawer abierto:',
    await evaluar(`document.querySelector('[data-cart-drawer]').classList.contains('is-open')`));
  console.log('  panel en pantalla:',
    await evaluar(`(() => {
      const p = document.querySelector('.cart-drawer__panel');
      const r = p.getBoundingClientRect();
      return Math.round(r.right) + ' de ' + window.innerWidth;
    })()`));

  // 4) Menu movil
  console.log('\n== Menu movil (viewport estrecho) ==');
  await enviar(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 420, height: 900, deviceScaleFactor: 1, mobile: true,
  });
  await sleep(1200);
  console.log('  burger visible:',
    await evaluar(`getComputedStyle(document.querySelector('[data-menu-open]')).display !== 'none'`));
  console.log('  clic en burger:',
    await evaluar(`(() => {
      document.querySelector('[data-menu-open]').click();
      return 'ok';
    })()`));
  await sleep(700);
  console.log('  menu abierto:',
    await evaluar(`document.querySelector('[data-mobile-menu]').classList.contains('is-open')`));

  console.log('\n== Errores de consola ==');
  console.log('  ', errores.length ? errores.join(' | ') : 'ninguno');

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error('FALLO:', e.message);
  chrome.kill();
  process.exit(1);
});
