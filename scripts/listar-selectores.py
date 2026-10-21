"""
Extrae todos los selectores del CSS para revisarlos.

Se imprimen con su numero de linea para poder detectarlos a simple vista
los que estan rotos (p.ej. ".a.is-open.b" en vez de ".a.is-open .b").
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")
CSS = ROOT / "src" / "styles" / "global.css"

texto = CSS.read_text(encoding="utf-8")
lineas = texto.split("\n")

# Se ignoran los bloques de @media / @keyframes para no sacar los selectores
# de sus llaves
profundidad = 0
buffer = ""
inicio = 0
en_media = 0
resultado = []

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
        if en_media == 0 and not bloque.startswith("@"):
            selectores = bloque.split("{")[0].strip()
            resultado.append((inicio, selectores))
        buffer = ""
        en_media = 0

print(f"selectores encontrados: {len(resultado)}\n")
for numero, selector in resultado:
    print(f"{numero:>5}  {selector}")
