# Sant Hair+ · Línea Capilar

Tienda online para la línea capilar de Sant Hair+. Construida con **Astro 7** (renderizado en servidor sobre Netlify), **Netlify Blobs** como base de datos y JavaScript nativo para el carrito.

El diseño replica la estructura de la tienda de referencia (Purelis Skincare) aplicando la identidad propia de Sant Hair: negro, dorado y crema cálido.

**Repositorio:** https://github.com/Videartive-Studios/sant-hair
**Estado actual:** `npm run build` ✅ · `npm run check` ✅ 0 errores, 0 avisos, 0 hints · `npm ci` ✅

---

## Índice

1. [Puesta en marcha](#1-puesta-en-marcha)
2. [Estructura](#2-estructura)
3. [Base de datos (Netlify Blobs)](#3-base-de-datos-netlify-blobs)
4. [Panel de administración](#4-panel-de-administración)
5. [Despliegue en Netlify](#5-despliegue-en-netlify)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Editar contenido](#7-editar-contenido)
8. [Control de calidad](#8-control-de-calidad)
9. [Pagos y descuentos](#9-pagos-y-descuentos)
10. [SEO](#10-seo)
11. [Seguridad](#11-seguridad)
12. [Imágenes](#12-imágenes)
13. [Pendientes antes de publicar](#13-pendientes-antes-de-publicar)
14. [Registro de cambios](#14-registro-de-cambios)

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
| `npm run dev` | Servidor de desarrollo (Astro + emulación de Netlify) |
| `npm run build` | Compila para producción (genera `dist/`) |
| `npm run preview` | Levanta el build de producción con `netlify dev` |
| `npm run check` | Verificación de tipos de Astro (0 errores, 0 avisos, 0 hints) |
| `npm run lint:copy` | Revisa el copy en busca de texto corrupto |
| `npm run lint:prosa` | Revisa puntos insertados dentro de frases en español |
| `npm run lint:css` | Revisa selectores CSS rotos (`.foo is-open` en vez de `.foo.is-open`) |
| `npm run lint:clases` | Revisa clases de estado partidas en el JavaScript |
| `npm run fix:copy` | Elimina caracteres CJK incrustados |
| `npm run fix:prosa` | Repone los puntos perdidos en los textos |
| `npm run imagenes:social` | Regenera la imagen de redes sociales y el icono de iOS |

> El adaptador de Netlify no soporta `astro preview`. Para probar el build de
> producción usa `npm run preview` (o `npx netlify dev`) y despliega en Netlify.

### Requisitos

- **Node.js 24** (la versión que usa Netlify en `netlify.toml`)
- **Python 3** con Pillow, para los scripts de imágenes y de QA
- **Chrome**, solo para los scripts de prueba con navegador real

---

## 2. Estructura

```
public_html/
├── astro.config.mjs        Configuración de Astro + adaptador Netlify + CSP
├── netlify.toml            Build, publish, headers, CSP y redirecciones
├── package.json            Dependencias y comandos
├── tsconfig.json           Tipos de Astro y rutas del alias "@/"
├── public/
│   ├── img/                Imágenes optimizadas (WebP, fondo recortado)
│   └── robots.txt
├── scripts/                Utilidades: imágenes y control de calidad
└── src/
    ├── components/         Header, Footer, TopBar, ProductCard, CartDrawer,
    │                       Icon, Marquee, JsonLd
    ├── data/               Catálogo semilla, textos del sitio, blog y legales
    ├── db/
    │   ├── blobs.ts        Capa de persistencia (Blobs en prod / archivo local)
    │   └── repo.ts         Consultas: productos, pedidos, suscriptores, mensajes
    ├── layouts/BaseLayout.astro
    ├── lib/
    │   ├── auth.ts         Autenticación del panel de administración
    │   ├── escape.ts       Escapado de HTML para el contenido del navegador
    │   ├── order-token.ts  Tokens firmados de acceso a un pedido
    │   ├── promo.ts        Cupones de descuento
    │   ├── rate-limit.ts   Limitador de peticiones por IP
    │   └── seo.ts          Datos estructurados (schema.org)
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

### Módulos nuevos

| Módulo | Responsabilidad |
| --- | --- |
| `src/lib/seo.ts` | Genera los datos estructurados de cada tipo de página |
| `src/components/JsonLd.astro` | Inserta un bloque JSON-LD en el HTML |
| `src/lib/promo.ts` | Declara los cupones y resuelve el descuento de un subtotal |
| `src/lib/order-token.ts` | Firma y verifica los tokens de acceso a un pedido |
| `src/lib/rate-limit.ts` | Limita las peticiones por IP y ámbito |
| `src/lib/escape.ts` | Escapa el contenido que viene del navegador |

---

## 3. Base de datos (Netlify Blobs)

En producción se usa **Netlify Blobs** con el store `santhair`. Netlify inyecta
`NETLIFY_BLOBS_CONTEXT` automáticamente en las Functions (un JSON en base64 con
el `siteID`, el `token` y las URLs de la API), por lo que no hay nada que
configurar.

> **No uses `NETLIFY_BLOBS_SITE_ID` / `NETLIFY_BLOBS_TOKEN`**: el SDK v11 ya no
> las lee. Si las defines a mano, la capa de persistencia las acepta, pero en
> Netlify la variable correcta es `NETLIFY_BLOBS_CONTEXT`.

En desarrollo local, `astro dev` emula Blobs con un servidor local (datos en
`.netlify/blobs-serve/`). Si el sitio se ejecuta fuera de Netlify y no hay
contexto, la app escribe en `.data/kv.json` (ignorado por git). Así
`npm run dev` funciona sin conexión ni cuentas.

### Claves almacenadas

| Clave | Contenido |
| --- | --- |
| `catalogo/productos` | Catálogo completo (precios, stock, publicación) |
| `catalogo/categorias` | Categorías |
| `pedidos/<id>` | Un pedido por clave |
| `suscriptores/<correo>` | Suscriptores del newsletter |
| `mensajes/<id>` | Mensajes del formulario de contacto |

El catálogo se **siembra automáticamente** la primera vez con `src/data/catalog.ts`.
A partir de ahí la base de datos manda y se edita desde el panel. Los productos
que solo existan en la base de datos (creados desde el panel) también se
muestran: la semilla no los borra.

---

## 4. Panel de administración

Ruta: **`/admin`**

Requiere las variables de entorno `ADMIN_PASSWORD` (y `ADMIN_SECRET`).
Sin `ADMIN_PASSWORD` el panel muestra "Panel deshabilitado" y no expone datos.

Permite:

- Ver los pedidos con su estado (pendiente / pagado / enviado / entregado / cancelado) y cambiarlo.
- Editar precio y stock de los productos, y publicarlos o despublicarlos.
- Consultar suscriptores del newsletter y mensajes de contacto.

Sesión por cookie `httpOnly` firmada con HMAC, válida 8 horas.

**Seguridad:**

- `ADMIN_SECRET` es **obligatoria en producción**: sin ella, cada reinicio de
  la función invalida la sesión del panel. Nunca uses un secreto fijo en el
  código, porque con él cualquiera puede falsificar la cookie de administrador.
- El login tiene **rate limiting**: 5 intentos fallidos por IP y cada 15 minutos.
  Los intentos correctos no cuentan, así que un administrador que se equivoca
  varias veces y luego acierta no se queda fuera.
- Un precio o un stock no numérico se rechaza con un error 400, en lugar de
  guardarse como 0.

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
   - `ORDER_TOKEN_SECRET` → cadena aleatoria larga (firma los tokens de pedido).
     Si no la defines, se usa `ADMIN_SECRET`.

   Genera las dos últimas con `openssl rand -hex 32`.
4. Despliega.

Netlify detecta el framework Astro automáticamente; si lo hace, la configuración
anterior se rellena sola.

> **Credenciales:** el archivo `datos acceso.txt` (WordPress y webmail) vive en
> la carpeta `Web/` madre, **fuera** del repositorio, y nunca se ha subido.
> El archivo `.env` local tampoco se versiona: solo se publica `.env.example`.

`netlify.toml` ya incluye el comando de build, el directorio de publicación, las
cabeceras de seguridad (HSTS, CSP, X-Frame-Options) y la redirección de `www`
y de `http` al dominio canónico `https://santhair.com`.

> **Sobre las funciones:** el adaptador `@astrojs/netlify` v8 genera la función
> SSR en `.netlify/v1/functions/ssr/` y el payload en `.netlify/v1/`. Netlify lo
> detecta solo, por eso `netlify.toml` **no** declara la carpeta `functions`
> (eso sobrescribiría la ubicación por defecto y rompería el despliegue).
>
> Para probar el build de producción de forma local usa `npm run preview`
> (no `astro preview`, que el adaptador de Netlify no soporta).

### Lo que hace Netlify al desplegar

1. `npm ci` — instala exactamente lo que dice `package-lock.json`.
2. `npm run build` — compila y genera la función SSR.
3. Sirve `dist/` como estáticos y `/` como función.

---

## 6. Variables de entorno

| Variable | ¿Obligatoria? | Para qué sirve |
| --- | --- | --- |
| `ADMIN_PASSWORD` | No | Habilita el panel `/admin` |
| `ADMIN_SECRET` | **Sí en producción** | Clave de firma de la sesión del panel |
| `ORDER_TOKEN_SECRET` | Recomendada | Clave de firma de los tokens de pedido (si no, se usa `ADMIN_SECRET`) |
| `NETLIFY_BLOBS_CONTEXT` | Automática | La inyecta Netlify |

Copia `.env.example` a `.env` si quieres documentar las tuyas.

---

## 7. Editar contenido

| Qué | Dónde |
| --- | --- |
| Nombre, teléfono, WhatsApp, redes, umbral de envío gratis | `src/data/site.ts` |
| Productos (nombre, precio, stock, copy, SEO) | `src/data/catalog.ts` (semilla) o el panel `/admin` |
| Blog, testimonios, preguntas frecuentes | `src/data/content.ts` |
| Textos legales | `src/data/legal.ts` |
| Colores, tipografías, espaciados | `src/styles/global.css` (variables CSS) |
| Cupones de descuento | `src/lib/promo.ts` |

**Nota:** los cambios en `catalog.ts` solo afectan a los productos **nuevos**. Para
modificar los existentes, usa el panel `/admin` (o borra la clave
`catalogo/productos` en Blobs para volver a sembrar).

---

## 8. Control de calidad

El proyecto incluye scripts de comprobacion (Python) que conviene ejecutar
despues de editar el codigo:

| Script | Que comprueba |
| --- | --- |
| `npm run check` | Verificación de tipos de Astro (0 errores, 0 avisos, 0 hints) |
| `npm run lint:copy` | Caracteres y palabras extranas en el copy |
| `npm run lint:prosa` | Puntos insertados dentro de frases en espanol |
| `npm run lint:css` | Selectores CSS rotos (`.foo is-open` en vez de `.foo.is-open`) |
| `npm run lint:clases` | Clases de estado partidas en el JavaScript |
| `python scripts/listar-selectores.py` | Lista todos los selectores del CSS para revisarlos |
| `node scripts/test-interaccion.mjs` | Prueba el carrito y el menú con un navegador real |
| `node scripts/test-scroll.mjs` | Comprueba las animaciones de entrada al hacer scroll |
| `node scripts/capturar.mjs <salida> <url>` | Captura una página entera con Chrome |
| `node scripts/capturar-admin.mjs <salida>` | Captura el panel de administración con la sesión iniciada |
| `npm run fix:copy` | Elimina caracteres CJK incrustados |
| `npm run fix:prosa` | Repone los puntos perdidos en los textos |

> **Importante:** los selectores CSS rotos no generan error de compilacion:
> el navegador simplemente deja de aplicar el estilo. Por eso `lint:css`
> es de uso obligatorio tras tocar `global.css`.

> Los scripts de `.mjs` requieren **Chrome instalado** en
> `C:\Program Files\Google\Chrome\Application\chrome.exe` y el servidor de
> desarrollo levantado en `:4321`.

> `lint:css` y `fix:prosa` **escriben en disco**: el primero corrige los
> selectores de `global.css` y el segundo repone los puntos del copy. Los
> `lint:*` son de solo lectura.

---

## 9. Pagos y descuentos

La tienda **no procesa pagos**: el checkout registra el pedido en la base de
datos y el cliente elige entre contra entrega, transferencia o coordinarlo por
WhatsApp. Esa información queda en `/admin` para gestionarla.

Para cobrar en línea hay que conectar una pasarela (MercadoPago, Wompi, PayU o
Stripe). El punto de integración es `src/pages/api/checkout.ts`: ahí se valida el
pedido y se descuenta el stock; habría que añadir la creación del pago y la
webhook de confirmación.

### Cupones

El cupón se anuncia en la barra superior (`SANT10`, 10% de descuento) y **se
aplica de verdad**: se puede introducir en el carrito y en el checkout.

- Los cupones se declaran en `src/lib/promo.ts`.
- El descuento se aplica sobre el subtotal, antes del envío.
- **El servidor es la fuente de verdad**: `api/checkout.ts` recalcula los
  precios contra la base de datos y valida el cupón. El navegador nunca decide
  el descuento.
- El pedido guarda el descuento aplicado y el código usado, para que el panel
  pueda verlo.
- El checkout no permite pedir más unidades de las que hay en stock.

---

## 10. SEO

| Qué | Dónde |
| --- | --- |
| Título y descripción por página | Propiedades `title` / `description` de cada página |
| Canonical | `BaseLayout.astro` (o el prop `canonical` de cada página) |
| Open Graph y Twitter Cards | `BaseLayout.astro` |
| Datos estructurados | `src/lib/seo.ts` + el componente `src/components/JsonLd.astro` |
| Sitemap | `src/pages/sitemap.xml.ts` |
| Cabecera CSP con hashes | `astro.config.mjs` (`security.csp`) |
| Imagen de redes | `public/img/og-santhair.png` (1200×630, PNG) |
| Icono de iOS | `public/img/apple-touch-icon.png` (180×180, PNG) |

**Datos estructurados que se emiten:**

| Tipo | Dónde |
| --- | --- |
| `Organization` + `WebSite` | Todas las páginas |
| `Product` | Ficha de producto (`/tienda/[slug]`) |
| `BreadcrumbList` | Tienda, producto, blog, artículo y legales |
| `FAQPage` | Página de contacto |
| `Article` | Entradas del blog |
| `ItemList` | Catálogo de la tienda |

**Detalles importantes:**

- **Los títulos no repiten la marca**: si la página ya menciona "Sant Hair+"
  (por ejemplo el nombre de un producto), `BaseLayout` no la añade otra vez.
- **El canonical conserva el parámetro de categoría**, de modo que coincide
  con las URLs que anuncia el sitemap. El sitemap lista 18 URLs únicas.
- **La imagen social es PNG**: Facebook, Twitter y LinkedIn no interpretan
  WebP en `og:image`, así que se genera en PNG con
  `npm run imagenes:social`.
- **404 reales**: un producto, artículo o documento legal inexistente devuelve
  status **404** conservando la URL original (`Astro.rewrite('/404')`), no una
  redirección 302. Evita el *soft-404* y mantiene la URL para el usuario.
- Las páginas privadas (`/carrito`, `/checkout`, `/gracias`, `/admin`) llevan
  `noindex, nofollow` y quedan fuera del sitemap.

---

## 11. Seguridad

### Resumen

| Capa | Qué hace |
| --- | --- |
| **CSP con hashes** | Astro 7 calcula el hash SHA-256 de los scripts en línea y lo añade a la cabecera. Sin `unsafe-inline` para los scripts. |
| **HSTS** | `max-age=31536000; includeSubDomains; preload` |
| **Dominio canónico** | `www` y `http` redirigen con 301 a `https://santhair.com` |
| **Tokens de pedido** | La página de confirmación solo muestra datos personales con un token HMAC válido |
| **Rate limiting** | Por IP y por ámbito, en todos los endpoints |
| **Escapado de HTML** | El contenido del carrito se escapa antes de inyectarlo |
| **Validación en el servidor** | Precios, stock, métodos de pago y asuntos se validan contra listas blancas |

### Rate limiting

| Ámbito | Límite | Ventana |
| --- | --- | --- |
| Login del panel | 5 intentos **fallidos** | 15 minutos |
| Formulario de contacto | 5 mensajes | 1 hora |
| Newsletter | 10 suscripciones | 1 hora |
| Checkout | 15 pedidos | 10 minutos |
| Escrituras del panel | 120 | 1 minuto |

El limitador vive en la memoria de la función, así que protege cada instancia
por separado. Para límites globales habría que usar un almacén compartido.

### CSP en producción

```
default-src 'self'; base-uri 'self'; frame-ancestors 'self'; form-action 'self';
object-src 'none'; connect-src 'self'; font-src 'self' data:;
img-src 'self' data: https:; manifest-src 'self'; upgrade-insecure-requests;
script-src 'self' 'sha256-…'; style-src 'self'; style-src-attr 'unsafe-inline'
```

Los atributos `style` en línea se permiten de forma explícita porque el diseño
los usa a menudo; para los scripts, en cambio, no hace falta `unsafe-inline`
porque Astro calcula su hash. En desarrollo la política es más permisiva, ya
que Vite inyecta los estilos en línea y no se pueden calcular sus hashes.

---

## 12. Imágenes

Las imágenes se generan desde `D:\Diana Santamaria\Sant Hair\Logo\Finales`:

```bash
python scripts/preparar-imagenes.py # recortes + conversiones a WebP
python scripts/post-proceso-imagenes.py # quita el fondo y crea el logo en tinta
python scripts/generar-imagenes-social.py # imagen de redes + icono de iOS
```

El resultado queda en `public/img/`:

| Archivo | Uso |
| --- | --- |
| `logo-horizontal-ink.webp` | Logo oscuro para la cabecera clara |
| `logo-horizontal.webp` | Logo dorado para el pie (fondo oscuro) |
| `logo-circular.png` | Logo circular |
| `producto-*.webp` | Fotos de producto con fondo transparente |
| `hero-fraccos.webp` | Los tres frascos sin fondo, con sombra inferior |
| `mockup-claro.webp` | Mockup de la línea completa sobre crema |
| `mockup-negro*.webp` | Mockups sobre negro (secciones oscuras) |
| `portada-*.webp` | Portadas de blog en 16:10 con el producto completo |
| `og-santhair.png` | Imagen de redes sociales (1200×630, PNG) |
| `apple-touch-icon.png` | Icono para iOS (180×180, PNG) |
| `favicon.webp` | Icono del sitio |

---

## 13. Pendientes antes de publicar

- [ ] Importar el repositorio en Netlify y desplegar.
- [ ] Configurar `ADMIN_PASSWORD`, `ADMIN_SECRET` y `ORDER_TOKEN_SECRET` en Netlify.
- [ ] Completar teléfono, WhatsApp, email y dirección reales en `src/data/site.ts`.
- [ ] Añadir el NIT y la razón social (requisito de la Ley 1581/2012 en Colombia).
- [ ] Confirmar las URLs reales de las redes sociales en `src/data/site.ts`.
- [ ] Revisar los textos legales con un abogado (`src/data/legal.ts`).
- [ ] Confirmar precios y descripciones de los tres productos.
- [ ] Verificar que el mockup de cada producto corresponde al envase correcto.
- [ ] Conectar una pasarela de pago si se quiere cobrar en línea.
- [ ] Redirigir el dominio `santhair.com` al sitio en Netlify.

---

## 14. Registro de cambios

### Revisión completa y corrección (8 commits)

La revisión del proyecto detectó **4 fallos críticos** que impedían publicar,
**13 problemas de severidad alta** y **28 de severidad media**. Todos están
corregidos.

#### Críticos — el sitio no funcionaba en producción

| Problema | Corrección |
| --- | --- |
| El `package-lock.json` estaba corrupto: 22 claves con el punto convertido en espacio (`@nodelib/fs stat`) y URLs de tarball inválidas (`registry npmjs org`). `npm ci` fallaba y Netlify no podía desplegar. | Lockfile regenerado. Se eliminaron además las entradas de React, que no se usaban en ningún archivo. |
| La detección de Blobs miraba `NETLIFY_BLOBS_SITE_ID` y `NETLIFY_BLOBS_TOKEN`, pero el SDK v11 ya no las lee. En producción la app caía al archivo local, cuyo directorio no se puede escribir en una función de Netlify. | Se lee el contexto `NETLIFY_BLOBS_CONTEXT` y se deja que el SDK lo resuelva. |
| `get()` se destructuraba como `{ value }`, pero en v11 devuelve el valor directamente. `kvGet` devolvía siempre `null`: el catálogo se resiembra en cada petición y las ediciones de precio y stock se perdían al instante. | Llamada correcta a la API v11, con paginación en `list()`. |
| El secreto de firma de la sesión era un valor fijo en el código. Con él, cualquiera podía falsificar la cookie de administrador. | Si `ADMIN_SECRET` no está definido se genera uno aleatorio por proceso. En producción es obligatoria. |

#### Altos

| Problema | Corrección |
| --- | --- |
| El cupón `SANT10` se anunciaba en la barra superior pero el checkout nunca lo aplicaba. | Implementado de verdad, con validación en el servidor (`src/lib/promo.ts`). |
| Los tres correos de los textos legales eran `contacto@santhair com`, inválidos: el cliente no podía ejercer sus derechos. | Corregidos a `contacto@santhair.com`. |
| El copy tenía fragmentos corruptos por la limpieza automática (`indicadouman`, `enveloped`, `Moisturizan`, `personally`, `finissimo`, `aggressive`) y frases pegadas. | Repuestos. |
| El copy entero iba sin tildes ni eñes: **6 caracteres acentuados en 86.662 letras**. | Reescritos todos los archivos de datos y páginas: **435 acentos en 109.453 letras**. |
| Las cuatro URLs de las redes sociales tenían el punto convertido en espacio: los ocho enlaces de la cabecera y del pie estaban rotos. | Corregidas. |
| `/gracias?id=SH-XXX` mostraba el email, el teléfono y la dirección del pedido a cualquiera que adivinara el identificador. | Token HMAC por pedido (`src/lib/order-token.ts`). Sin token no se muestra ningún dato personal. |
| Ningún endpoint limitaba las peticiones, ni siquiera el login del panel. | Limitador por IP y ámbito (`src/lib/rate-limit.ts`). |
| No se emitía ningún dato estructurado: se perdían los resultados enriquecidos de producto, FAQ y migas de pan. | `src/lib/seo.ts` con Organization, WebSite, Product, BreadcrumbList, FAQPage, Article e ItemList. |
| El `tsconfig.json` tenía `.astro/types d ts`, así que los tipos de Astro no se cargaban. | Corregido a `.astro/types.d.ts`. |
| El script `lint:copy` apuntaba a `limpiar-copy py` (sin el punto) y no se ejecutaba nunca. | Corregido, y añadidos los comandos que faltaban. |
| Faltaban `@types/node` y `@astrojs/check`: 16 errores de TypeScript y el control de calidad no existía. | Instalados. `tsc --noEmit` pasa de 16 errores a 0. |
| `set()` recibía la opción `type`, que no existe en `SetOptions` de la v11. | Corregido. |

#### Medios — SEO y calidad

- **CSP con hashes SHA-256** mediante `security.csp` de Astro 7, sin `unsafe-inline` para los scripts.
- **HSTS** y redirección con 301 de `www` y de `http` al dominio canónico, para evitar contenido duplicado.
- **404 reales** con `Astro.rewrite('/404')` en lugar de redirecciones 302 en producto, artículo y documento legal.
- **Imagen social en PNG** (1200×630): Facebook, Twitter y LinkedIn no interpretan WebP en `og:image`.
- **Open Graph y Twitter Cards** completos, con `og:image:alt`, dimensiones y `og:type` por página.
- **Títulos sin repetir la marca** cuando la página ya la menciona.
- **Canonical coherente con el sitemap**: el sitemap pasó de 22 a 18 URLs únicas, sin duplicados.
- **`<h1>` añadido** al checkout, que era la única página sin él.
- **Alt texts** descriptivos en las imágenes de producto y de categoría.
- **Icono de iOS en PNG** de 180×180, que es lo que iOS acepta.
- **Escapado del contenido del carrito**: vive en `localStorage` y cualquiera puede editarlo a mano.
- **Validación en el servidor**: precio, stock, método de pago y asunto se validan contra listas blancas, y los campos tienen longitud máxima.
- **`getProducts()`** devuelve también los productos que solo existen en la base de datos.
- **Identificador de pedido** de 4 caracteres aleatorios a 6 bytes en hexadecimal, para que no sea adivinable.
- **El panel ya no miente**: antes los `PATCH` no comprobaban la respuesta y la interfaz daba un cambio por guardado cuando no se había guardado.
- **Paginación en `list()`**: los pedidos por encima del límite de página ya no desaparecen del panel sin avisar.

### Verificación

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | ✅ Complete! |
| `npm run check` | ✅ 0 errores, 0 avisos, 0 hints |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm ci` | ✅ up to date |
| `lint:copy` / `lint:prosa` / `lint:css` / `lint:clases` | ✅ 0 sospechosos |
| Cabecera CSP en producción | ✅ Emitida con los hashes de los scripts |
| JSON-LD | ✅ JSON válido en las 7 páginas comprobadas |
| Jerarquía de encabezados | ✅ 1 `<h1>` por página, sin enlaces internos rotos |
| Rate limiting | ✅ Bloquea en los 4 ámbitos |
| Tokens de pedido | ✅ Sin token no se muestran datos personales |
| Panel de administración | ✅ Lee y escribe en la base de datos |
| Revisión visual (Chrome) | ✅ Portada, checkout, ficha de producto y panel |

### Commits

```
01fa9c1  docs: actualiza el README con la arquitectura y el despliegue reales
075931d  feat: anade la politica de seguridad de contenido y la configuracion final
abc12c6  feat: anade los datos estructurados y completa el SEO del sitio
fe66722  feat: aplica el cupon SANT10 anunciado en la barra superior
b494d2d  feat: cierra la fuga de datos del pedido y limita las peticiones
29b9827  fix: restituye la ortografia y las tildes de todo el copy
0fe1669  fix: corrige la capa de persistencia de Netlify Blobs
22ee139  chore: regenera el lockfile y corrige tsconfig y scripts de QA
```
