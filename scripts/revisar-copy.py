import io
import re
import sys
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")

# Tokens sospechosos que aparecen cuando el generador mezcla idiomas dentro del copy.
# Los comentarios HTML <!-- --> y los CJK se comprueban por separado.
SUSPECT = [
    "Vocabulary", "Winvalid", "Nebula", "REEL?", "OPAomaticamente",
    "Stripping", "gotthe", "absorbser", "nitimezone", "ZZicapelludo",
    "三项", "：，往", "来源", "一步", "fussan de",
]

FIXES = {
    "      'Un ultimo consejo: alterna el uso de la":
        "      'Un ultimo consejo: alterna el uso de la mascarilla con el del condicionador. "
        "El condicionador trabaja en la superficie y la mascarilla trabaja en la profundidad. "
        "Juntos, en la misma semana, dan el mejor resultado.',",
    "Me encanta que fussan de los claims y aqui los ingredientes estan a la vista.":
        "Me encanta que no sean promesas vacias: aqui los ingredientes estan a la vista.",
}

def scan():
    problems = []
    for path in ROOT.rglob("*"):
        if path.is_dir():
            continue
        if any(part in {"node_modules", "dist", ".netlify", ".astro", ".data"} for part in path.parts):
            continue
        if path.suffix not in {".ts", ".tsx", ".astro", ".js", ".mjs", ".css", ".json"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for i, line in enumerate(text.split("\n"), 1):
            for token in SUSPECT:
                if token.lower() in line.lower():
                    problems.append((str(path.relative_to(ROOT)), i, token, line.strip()[:140]))
    return problems

def apply_fixes():
    changed = []
    for path in ROOT.rglob("*"):
        if path.is_dir() or path.suffix not in {".ts", ".tsx", ".astro"}:
            continue
        if any(part in {"node_modules", "dist", ".netlify", ".astro", ".data"} for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        lines = text.split("\n")
        for idx, line in enumerate(lines):
            for key, value in FIXES.items():
                if key in line:
                    lines[idx] = value
                    break
        text = "\n".join(lines)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    return changed

if __name__ == "__main__":
    if "--fix" in sys.argv:
        for c in apply_fixes():
            print("FIX:", c)
    problems = scan()
    if not problems:
        print("OK: sin artefactos de idioma detectados.")
    for rel, line, token, snippet in problems:
        print(f"{rel}:{line}  [{token}]  {snippet}")
    sys.exit(0)
