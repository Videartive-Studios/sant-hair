"""
Limpia artefactos de generacion en los archivos de texto del proyecto.

Regla unica y conservadora: eliminar secuencias CJK (caracteres chinos,
coreanos o japoneses) que se cuelan en el copy en español. No se toca la
formatação, la indentación ni los espacios: este script solo puede
empeorar el código si se aplica sobre un archivo ya correcto.

Uso:  python scripts/limpiar-copy.py --fix
"""
import re
import sys
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")
TEXT_EXT = {".ts", ".tsx", ".astro", ".js", ".mjs", ".css", ".json", ".md"}
SKIP_DIRS = {"node_modules", "dist", ".netlify", ".astro", ".data", ".git"}

CJK = re.compile(r"[\u3000-\u9fff\uac00-\ud7af]+")


def clean(text: str) -> str:
    return CJK.sub("", text)


def main() -> int:
    apply = "--fix" in sys.argv
    changed: list[str] = []
    remaining: list[str] = []

    for path in sorted(ROOT.rglob("*")):
        if path.is_dir() or path.suffix not in TEXT_EXT:
            continue
        if any(p in SKIP_DIRS for p in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue

        cleaned = clean(text)
        if cleaned != text:
            changed.append(str(path.relative_to(ROOT)))
            if apply:
                path.write_text(cleaned, encoding="utf-8")

        for i, line in enumerate(cleaned.split("\n"), 1):
            if CJK.search(line):
                remaining.append(f"{path.relative_to(ROOT)}:{i}")

    report = [
        f"Archivos con CJK eliminado: {len(changed)}",
        *[f"  - {c}" for c in changed],
        f"Lineas con CJK restantes: {len(remaining)}",
        *[f"  - {r}" for r in remaining],
    ]
    (ROOT / "scripts" / "_reporte-limpieza.txt").write_text(
        "\n".join(report), encoding="utf-8"
    )
    print("\n".join(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
