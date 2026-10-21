"""
Detector de同类 danos en el resto del codigo: un punto eliminado entre un
identificador y un nombre con guion (clases "is-*", atributos "data-*",
metodos de la API DOM, etc.).

Por ejemplo: "element is-open" o "data cart-body" donde deberia decir
"element.is-open" o "data-cart-body".
"""
import re
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")

PATRONES = [
    # identificador + clase de estado suelta
    (re.compile(r"(?<![\w-])([a-zA-Z_$][\w$]*) (is-[a-z-]+)\b"), "clase de estado"),
    # atributo data-* partido
    (re.compile(r"(?<![\w-])data ([a-z][a-z-]{2,})\b"), "atributo data-*"),
    # 'nombre' partido dentro de cadenas
    (re.compile(r"\['([a-z-]+) ([a-z-]+)'\]"), "selector partido"),
]

encontrados = []
for path in sorted((ROOT / "src").rglob("*")):
    if path.is_dir() or path.suffix not in {".ts", ".astro"}:
        continue
    texto = path.read_text(encoding="utf-8")
    for patron, etiqueta in PATRONES:
        for m in patron.finditer(texto):
            linea = texto[: m.start()].count("\n") + 1
            encontrados.append(
                f"{path.relative_to(ROOT)}:{linia}  [{etiqueta}]  {m.group(0)!r}"
            )

print("sospechosos:", len(encontrados))
for e in encontrados:
    print(" ", e)
