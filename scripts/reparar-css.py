"""
Repara los selectores CSS a los que la limpieza automatica les quito el
combinador de descendencia (".a.is-open.b" en vez de ".a.is-open .b") y
elimina el bloque duplicado del pie.

El dano no genera error de compilacion: el navegador simplemente deja de
aplicar la regla. Por eso el sitio puede compilar y aun asi verse roto.
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")
CSS = ROOT / "src" / "styles" / "global.css"
texto = CSS.read_text(encoding="utf-8")

# ----------------------------------------------------------------------
# 1. Selectores rotos: se devuelve el espacio
# ----------------------------------------------------------------------
SELECTORES = [
    (".section--ink.eyebrow", ".section--ink .eyebrow"),
    (".section--ink.lede", ".section--ink .lede"),
    (".section--ink.text-gold", ".section--ink .text-gold"),
    (
        ".product-card:hover.product-card__media img",
        ".product-card:hover .product-card__media img",
    ),
    (
        ".category-card:hover.category-card__img",
        ".category-card:hover .category-card__img",
    ),
    (".newsletter__form.input:focus", ".newsletter__form .input:focus"),
    (".newsletter__form.input", ".newsletter__form .input"),
    (".newsletter__form.btn", ".newsletter__form .btn"),
    (
        ".cart-drawer.is-open.cart-drawer__overlay",
        ".cart-drawer.is-open .cart-drawer__overlay",
    ),
    (
        ".cart-drawer.is-open.cart-drawer__panel",
        ".cart-drawer.is-open .cart-drawer__panel",
    ),
    (
        ".post-card:hover.post-card__media img",
        ".post-card:hover .post-card__media img",
    ),
    (
        ".accordion__item[open].accordion__icon::after",
        ".accordion__item[open] .accordion__icon::after",
    ),
    (".filter-list.is-active", ".filter-list .is-active"),
    (".steps.is-active", ".steps .is-active"),
]

print("== Selectores reparados ==")
for roto, bueno in SELECTORES:
    if roto in texto:
        texto = texto.replace(roto, bueno)
        print(f"  {roto}  ->  {bueno}")

# ----------------------------------------------------------------------
# 2. Bloque duplicado del pie
# ----------------------------------------------------------------------
print("\n== Bloque duplicado ==")
bloque = """.footer__credit strong {
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--gold-soft);
}

.footer__credit-mark {
  width: 5px;
  height: 5px;
  flex: none;
  background: var(--gold);
  opacity: 0.65;
  transform: rotate(45deg);
}
"""

partes = texto.split(bloque)
if len(partes) > 2:
    texto = bloque.join(partes[:2]) + "".join(partes[2:])
    print(f"  eliminadas {len(partes) - 2} copia(s) del bloque del pie")
else:
    print("  sin duplicados")

CSS.write_text(texto, encoding="utf-8")

# ----------------------------------------------------------------------
# 3. Comprobacion: se listan de nuevo los selectores para revisarlos
# ----------------------------------------------------------------------
texto = CSS.read_text(encoding="utf-8")
lineas = texto.split("\n")
buffer = ""
inicio = 0
profundidad = 0
en_media = 0
sospechosos = []

for numero, linea in enumerate(lineas, 1):
    limpia = linea.split("/*")[0]
    if not buffer:
        inicio = numero
        buffer = ""
    buffer += limpia
    if "@media" in limpia or "@supports" in limpia:
        en_media += 1
    profundidad += limpia.count("{") - limpia.count("}")
    if profundidad == 0 and "{" in buffer:
        bloque = buffer.strip()
        if not bloque.startswith("@"):
            selectores = bloque.split("{")[0].strip()
            # Un selector sospechoso: dos clases pegadas sin combinador
            # (.a.b) donde la segunda parte es un elemento o clase hija.
            for parte in selectores.split(","):
                parte = parte.strip()
                if re.search(r"\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", parte):
                    # Descarta los casos legitimos: pseudo-clases y
                    # elementos (div.clase, .a:not(...), .a:hover)
                    if re.search(
                        r"\.[A-Za-z0-9_-]+:(?!:)|\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)"
                        r"(?![A-Za-z0-9_-]*\s*[:\[])",
                        parte,
                    ):
                        pass
        if en_media == 0:
            pass
        buffer = ""
        en_media = 0

print("\n== Comprobacion final ==")
for roto, _ in SELECTORES:
    if roto in texto:
        print(f"  PENDIENTE: {roto}")
print("  revision manual de selectores: scripts/listar-selectores.py")
