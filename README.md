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
| `npm run dev` | Servidor de desarrollo (Astro + emulación de Netlify) |
| `npm run build` | Compila para producción (genera `dist/`) |
| `npm run preview` | Levanta el build de producción con `netlify dev` |
| `npm run check` | Verificación de tipos de Astro (0 errores, 0 avisos) |
| `npm run lint:copy` | Revisa el copy en busca de texto corrupto |
| `npm run lint:prosa` | Revisa puntos insertados dentro de frases en español |
| `npm run lint:css` | Revisa selectores CSS rotos (`.foo is-open` en vez de `.foo.is-open`) |
| `npm run lint:clases` | Revisa clases de estado partidas en el JavaScript |
| `npm run fix:copy` | Elimina caracteres CJK incrustados |
| `npm run fix:prosa` | Repone los puntos perdidos en los textos |
| `npm run imagenes:social` | Regenera la imagen de redes sociales y el icono de iOS |

> El adaptador de Netlify no soporta `astro preview`. Para probar el build de
> producción usa `npm run preview` (o `npx netlify dev`) y despliega en Netlify.

---

## 2. Estructura

```
public_html/
├── astro.config.mjs        Configuración de Astro + adaptador Netlify + CSP
├── netlify.toml            Build, publish, headers, CSP y redirecciones
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
A partir de ahí la base de datos manda y se edita desde el panel.

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
  Los intentos correctos no cuentan.

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

**Nota:** los cambios en `catalog.ts` solo afectan a los productos **nuevos**. Para
modificar los existentes, usa el panel `/admin` (o borra la clave
`catalogo/productos` en Blobs para volver a sembrar).

---

## 8. Control de calidad

El proyecto incluye scripts de comprobacion (Python) que conviene ejecutar
despues de editar el codigo:

| Script | Que comprueba |
| --- | --- |
| `npm run lint:copy` | Caracteres y palabras extranas en el copy |
| `npm run lint:prosa` | Puntos insertados dentro de frases en espanol |
| `npm run lint:css` | Selectores CSS rotos (`.foo is-open` en vez de `.foo.is-open`) |
| `npm run lint:clases` | Clases de estado partidas en el JavaScript |
| `python scripts/listar-selectores.py` | Lista todos los selectores del CSS para revisarlos |
| `node scripts/test-interaccion.mjs` | Prueba el carrito y el menú con un navegador real |
| `node scripts/test-scroll.mjs` | Comprueba las animaciones de entrada al hacer scroll |
| `npm run fix:copy` | Elimina caracteres CJK incrustados |
| `npm run fix:prosa` | Repone los puntos perdidos en los textos |
| `npm run check` | Verificación de tipos de Astro |

> **Importante:** los selectores CSS rotos no generan error de compilacion:
> el navegador simplemente deja de aplicar el estilo. Por eso `lint:css`
> es de uso obligatorio tras tocar `global.css`.

> Los scripts de `.mjs` requieren **Chrome instalado** en
> `C:\Program Files\Google\Chrome\Application\chrome.exe` y el servidor de
> desarrollo levantado en `:4321`.

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

**Datos estructurados que se emiten:**

| Tipo | Dónde |
| --- | --- |
| `Organization` + `WebSite` | Todas las páginas |
| `Product` | Ficha de producto (`/tienda/[slug]`) |
| `BreadcrumbList` | Tienda, producto, blog, artículo y legales |
| `FAQPage` | Página de contacto |
| `Article` | Entradas del blog |
| `ItemList` | Catálogo de la tienda |

**Imagen social:** `public/img/og-santhair.png` (1200×630). Facebook, Twitter y
LinkedIn no interpretan WebP en `og:image`, por eso la imagen es PNG. Se
regenera con `npm run imagenes:social`.

**404 reales:** un producto, artículo o documento legal inexistente devuelve
status **404** conservando la URL original (`Astro.rewrite('/404')`), no una
redirección 302.

---

## 11. Pendientes antes de publicar

- [ ] Completar teléfono, WhatsApp y dirección reales en `src/data/site.ts`.
- [ ] Revisar los textos legales con un abogado (`src/data/legal.ts`).
- [ ] Confirmar precios y descripciones de los tres productos.
- [ ] Verificar que el mockup de cada producto corresponde al envase correcto.
- [ ] Configurar `ADMIN_PASSWORD`, `ADMIN_SECRET` y `ORDER_TOKEN_SECRET` en Netlify.
- [ ] Confirmar las URLs reales de las redes sociales en `src/data/site.ts`.
- [ ] Conectar una pasarela de pago si se quiere cobrar en línea.
- [ ] Redirigir el dominio `santhair.com` al sitio en Netlify.

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
