"""
Detector de selectores CSS rotos.

La reparacion automatica occasionally converts "X.Y" into "X Y", which in CSS
turns ".foo.is-open" into ".foo is-open" (a descendant selector that never
matches). These selectors are compiled by the browser with no error, so the
styles simply stop working.

This script finds and fixes them.
"""
import re
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")
CSS = ROOT / "src" / "styles" / "global.css"

texto = CSS.read_text(encoding="utf-8")

# .clase is-visible / .clase:hover / .clase::before / .clase>hijo
PATRON = re.compile(r"(\.[A-Za-z0-9_-]+)\s+((?:is|has|js)-[a-z-]+|:[a-z-]+|::?[a-z-]+)")

print("selectores rotos encontrados:")
encontrados = []
for m in PATRON.finditer(texto):
    encontrados.append(m.group(0))
    linea = texto[: m.start()].count("\n") + 1
    print(f"  L{linea}: {m.group(0)!r}")

if not encontrados:
    print("  (ninguno)")

# Correccion: vuelve a unir la clase con su modificador
corregido = PATRON.sub(r"\1.\2", texto)

# Antes de guardar, se comprueba que no se rompa nada: los selectores que
# empiezan por una pseudo-clase o por un elemento NO se tocan.
if corregido != texto:
    CSS.write_text(corregido, encoding="utf-8")
    print(f"\ncorregidos: {len(encontrados)}")

    # Verificacion
    texto = CSS.read_text(encoding="utf-8")
    restantes = PATRON.findall(texto)
    print("restantes:", len(restantes))
else:
    print("\nsin cambios")
