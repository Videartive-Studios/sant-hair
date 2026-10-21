# Sant Hair+ · Línea Capilar

Tienda online para la línea capilar de Sant Hair+. Construida con **Astro 7** (renderizado en servidor sobre Netlify), **Netlify Blobs** como base de datos y JavaScript nativo para el carrito.

El diseño replica la estructura de la tienda de referencia (Purelis Skincare) aplicando la identidad propia de Sant Hair: negro, dorado y crema cálido.

---

## 1. Puesta en marcha

```bash
cd public_html
npm install
npm run dev # http://localhost:4321
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción (genera `dist/`) |
| `npm run check` | Verificación de tipos de Astro |
| `npm run lint:copy` | Revisa el copy en busca de texto corrupto |

> El adaptador de Netlify no soporta `astro preview`. Para probar el build de
> producción usa `npx netlify dev` o despliega en Netlify.

---

## 2. Estructura

```
public_html/
├── astro.config.mjs        Configuración de Astro + adaptador Netlify
├── netlify.toml            Build, publish, headers y cache
├── public/
│   ├── img/                Imágenes optimizadas (WebP, fondos recortados)
│   └── robots.txt
├── scripts/                Utilidades: imágenes y control de calidad
└── src/
    ├── components/         Header, Footer, TopBar, ProductCard, CartDrawer,
    │                       Icon, Marquee
    ├── data/               Catálogo semilla, textos del sitio, blog y legales
    ├── db/
    │   ├── blobs.ts        Capa de persistencia (Blobs en prod / archivo local)
    │   └── repo.ts         Consultas: productos, pedidos, suscriptores, mensajes
    ├── layouts/BaseLayout.astro
    ├── lib/auth.ts         Autenticación del panel de administración
    ├── pages/
    │   ├── index.astro                 Portada
    │   ├── tienda/                     Catálogo con filtros y ficha de producto
    │   ├── blog/                       Artículos
    │   ├── carrito.astro              Carrito
    │   ├── checkout.astro             Datos de envío
    │   ├── gracias.astro              Confirmación del pedido
    │   ├── contacto.astro             Formulario y preguntas frecuentes
    │   ├── nosotros.astro             Página de marca
    │   ├── admin.astro                Panel de administración
    │   ├── 404.astro                  Página de error
    │   ├── legal/[slug].astro         Páginas legales
    │   ├── sitemap.xml.ts             Sitemap dinámico
    │   └── api/                       Endpoints: newsletter, contact, checkout, admin
    ├── scripts/cart.ts     Carrito (localStorage + eventos)
    └── styles/global.css   Sistema de diseño
```

---

## 3. Base de datos (Netlify Blobs)

En producción se usa **Netlify Blobs** con el store `santhair`. Netlify inyecta
`NETLIFY_BLOBS_SITE_ID` y `NETLIFY_BLOBS_TOKEN` automáticamente en las Functions,
por lo que no hay nada que configurar.

En desarrollo local, si no hay esas variables, la app escribe en
`.data/kv json` (ignorado por git). Así `npm run dev` funciona sin conexión ni cuentas.

### Claves almacenadas

| Clave | Contenido |
| --- | --- |
| `catalogo/productos` | Catálogo completo (precios, stock, publicación) |
| `catalogo/categorias` | Categorías |
| `pedidos/<id>` | Un pedido por clave |
| `suscriptores/<correo>` | Suscriptores del newsletter |
| `mensajes/<id>` | Mensajes del formulario de contacto |

El catálogo se **siembra automáticamente** la primera vez con `src/data/catalog ts`.
A partir de ahí la base de datos manda y se edita desde el panel.

---

## 4. Panel de administración

Ruta: **`/admin`**

Requiere las variables de entorno `ADMIN_PASSWORD` (y opcionalmente `ADMIN_SECRET`).
Sin `ADMIN_PASSWORD` el panel muestra "Panel deshabilitado" y no expone datos.

Permite:

- Ver los pedidos con su estado (pendiente / pagado / enviado / entregado / cancelado) y cambiarlo.
- Editar precio y stock de los productos, y publicarlos o despublicarlos.
- Consultar suscriptores del newsletter y mensajes de contacto.

Sesión por cookie `httpOnly` firmada con HMAC, válida 8 horas.

---

## 5. Despliegue en Netlify

El repositorio es **https://github.com/Videartive-Studios/sant-hair** y su
raíz es ya la raíz del proyecto Astro.

1. En Netlify: **Add new site → Import an existing project** y elige
   `Videartive-Studios/sant-hair`.
2. Configuración (la mayoría ya viene en `netlify.toml`):
   - **Base directory**: *(vacío)*
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `24`
3. En **Site settings → Environment variables** define:
   - `ADMIN_PASSWORD` → contraseña del panel.
   - `ADMIN_SECRET` → cadena aleatoria larga (se usa para firmar las sesiones).
4. Despliega.

Netlify detecta el framework Astro automáticamente; si lo hace, la configuración
anterior se rellena sola.

> **Credenciales:** el archivo `datos acceso.txt` (WordPress y webmail) vive en
> la carpeta `Web/` madre, **fuera** del repositorio, y nunca se ha subido.
> El archivo `.env` local tampoco se versiona: solo se publica `.env.example`.

`netlify.toml` ya incluye el comando de build, el directorio de publicación, las
cabeceras de seguridad y las reglas de caché de imágenes y fuentes.

> **Sobre las funciones:** el adaptador `@astrojs/netlify` v8 genera la función
> SSR en `.netlify/v1/functions/ssr/` y el payload en `.netlify/v1/`. Netlify lo
> detecta solo, por eso `netlify.toml` **no** declara la carpeta `functions`
> (eso sobrescribiría la ubicación por defecto y rompería el despliegue).
>
> Para probar el build de producción de forma local usa `npx netlify dev`
> (no `astro preview`, que el adaptador de Netlify no soporta).

---

## 6. Variables de entorno

| Variable | ¿Obligatoria? | Para qué sirve |
| --- | --- | --- |
| `ADMIN_PASSWORD` | No | Habilita el panel `/admin` |
| `ADMIN_SECRET` | No | Clave de firma de la sesión (usa una larga y aleatoria) |
| `NETLIFY_BLOBS_SITE_ID` | Automática | La inyecta Netlify |
| `NETLIFY_BLOBS_TOKEN` | Automática | La inyecta Netlify |

Copia `.env example` a `.env` si quieres documentar las tuyas.

---

## 7. Editar contenido

| Qué | Dónde |
| --- | --- |
| Nombre, teléfono, WhatsApp, redes, umbral de envío gratis | `src/data/site ts` |
| Productos (nombre, precio, stock, copy, SEO) | `src/data/catalog ts` (semilla) o el panel `/admin` |
| Blog, testimonios, preguntas frecuentes | `src/data/content ts` |
| Textos legales | `src/data/legal ts` |
| Colores, tipografías, espaciados | `src/styles/global css` (variables CSS) |

**Nota:** los cambios en `catalog ts` solo afectan a los productos **nuevos**. Para
modificar los existentes, usa el panel `/admin` (o borra la clave
`catalogo/productos` en Blobs para volver a sembrar).

---

## 8. Control de calidad

El proyecto incluye scripts de comprobacion (Python) que conviene ejecutar
despues de editar el codigo:

| Script | Que comprueba |
| --- | --- |
| `python scripts/revisar-copy.py` | Caracteres y palabras extranas en el copy |
| `python scripts/revisar-prosa.py` | Puntos insertados dentro de frases en espanol |
| `python scripts/revisar-css.py` | Selectores CSS rotos (`.foo is-open` en vez de `.foo.is-open`) |
| `python scripts/revisar-clases.py` | Clases de estado partidas en el JavaScript |
| `python scripts/listar-selectores.py` | Lista todos los selectores del CSS para revisarlos |
| `node scripts/test-interaccion.mjs` | Prueba el carrito y el menú con un navegador real |
| `node scripts/test-scroll.mjs` | Comprueba las animaciones de entrada al hacer scroll |
| `python scripts/limpiar-copy.py --fix` | Elimina caracteres CJK incrustados |
| `python scripts/corregir-prosa.py` | Repone los puntos perdidos en los textos |

> **Importante:** los selectores CSS rotos no generan error de compilacion:
> el navegador simplemente deja de aplicar el estilo. Por eso `revisar-css.py`
> es de uso obligatorio tras tocar `global.css`.

---

## 9. Pagos

La tienda **no procesa pagos**: el checkout registra el pedido en la base de datos
y el cliente elige entre contra entrega, transferencia o coordinarlo por WhatsApp.
Esa información queda en `/admin` para gestionarla.

Para cobrar en línea hay que conectar una pasarela (MercadoPago, Wompi, PayU o
Stripe). El punto de integración es `src/pages/api/checkout ts`: ahí se valida el
pedido y se descuenta el stock; habría que añadir la creación del pago y la
webhook de confirmación.

---

## 10. Pendientes antes de publicar

- [ ] Completar teléfono, WhatsApp y dirección reales en `src/data/site ts`.
- [ ] Revisar los textos legales con un abogado (`src/data/legal ts`).
- [ ] Confirmar precios y descripciones de los tres productos.
- [ ] Verificar que el mockup de cada producto corresponde al envase correcto.
- [ ] Configurar `ADMIN_PASSWORD` y `ADMIN_SECRET` en Netlify.
- [ ] Definir si el descuento `SANT10` del aviso superior se aplica en el checkout.
- [ ] Conectar una pasarela de pago si se quiere cobrar en línea.
- [ ] Redirigir el dominio `santhair com` al sitio en Netlify.

---

## 11. Imágenes

Las imágenes se generan desde `D:\Diana Santamaria\Sant Hair\Logo\Finales`:

```bash
python scripts/preparar-imagenes py # recortes + conversiones a WebP
python scripts/post-proceso-imagenes py # quita el fondo y crea el logo en tinta
```

El resultado queda en `public/img/`:

| Archivo | Uso |
| --- | --- |
| `logo-horizontal-ink webp` | Logo oscuro para la cabecera clara |
| `logo-horizontal webp` | Logo dorado para el pie (fondo oscuro) |
| `logo-circular png` | Logo circular para la página "Nosotros" |
| `producto-*.webp` | Fotos de producto con fondo transparente |
| `hero-fraccos.webp` | Los tres frascos sin fondo, con sombra inferior |
| `portada-*.webp` | Portadas de blog en 16:10 con el producto completo |
| `logo-circular-claro.png` | Logo circular sin fondo negro |
| `logo-horizontal-blanco.webp` | Logo dorado sobre fondo blanco |
| `mockup-claro webp` | Mockup de la línea completa sobre crema (portada) |
| `mockup-negro*.webp` | Mockups sobre negro (secciones oscuras) |
| `favicon webp` / `favicon-blanco webp` | Iconos del sitio |

> **Imagenes de producto:** todas las fotos de frascos se generan sin fondo y
> con sombra inferior (`hero-fraccos.webp`, `producto-*.webp`, `portada-*.webp`),
> de modo que se integran en cualquier color de seccion. Para el logo hay dos
> variantes: con fondo blanco (`logo-horizontal-blanco.webp`) y sin fondo
> (`logo-horizontal.webp`).
