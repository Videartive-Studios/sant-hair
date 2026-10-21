"""
Revision del copy: busca puntos que se hayan colado dentro de frases en
espanol (por ejemplo "Ver.colecciones").

Criterio: en codigo real, un punto va siempre seguido de una propiedad
JavaScript con identificador o de una extension de archivo. Si aparece un
punto entre dos palabras en minusculas y la segunda NO es ni una propiedad
conocida ni una extension, es suspecto.
"""
import importlib.util
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")

spec = importlib.util.spec_from_file_location(
    "reparar", ROOT / "scripts" / "reparar-dano.py"
)
reparar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reparar)
PROPS = reparar.PROPS

EXTENSIONES = {
    "astro", "ts", "tsx", "js", "mjs", "cjs", "json", "css", "html", "xml",
    "webp", "png", "jpg", "jpeg", "gif", "svg", "ico", "txt", "md", "pdf",
    "com", "co", "net", "org", "io", "dev", "app", "me", "es", "mx", "info",
}

PATRON = re.compile(
    r"(?<![A-Za-z0-9_$])([a-z]{3,})\.([a-z]{3,})(?![A-Za-z0-9_$])"
)

encontrados = []
for path in sorted((ROOT / "src").rglob("*")):
    if path.is_dir() or path.suffix not in {".ts", ".astro"}:
        continue
    texto = path.read_text(encoding="utf-8")
    for i, linea in enumerate(texto.split("\n"), 1):
        for m in PATRON.finditer(linea):
            segunda = m.group(2)
            if segunda in PROPS or segunda in EXTENSIONES:
                continue
            if m.group(1) in {"www"}:
                continue
            encontrados.append(
                f"{path.relative_to(ROOT)}:{i}  [{m.group(0)}]  {linea.strip()[:92]}"
            )

print("sospechosos:", len(encontrados))
for e in encontrados:
    print(" ", e)
