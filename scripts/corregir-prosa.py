"""
Correccion de textos afectados por la reparacion automatica:
puntos insertados dentro de frases en espanol y la declaracion XML
del sitemap.
"""
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")

FIXES = {
    "src/pages/carrito.astro": [
        ("Todavia no has agregado.productos.", "Todavia no has agregado productos."),
    ],
    "src/pages/checkout.astro": [
        ("Cargando.productos...", "Cargando productos..."),
    ],
    "src/pages/contacto.astro": [
        ("Enviar.mensaje", "Enviar mensaje"),
    ],
    "src/pages/index.astro": [
        ("Ver.colecciones", "Ver colecciones"),
    ],
    "src/pages/tienda/index.astro": [
        ("Ver.colecciones", "Ver colecciones"),
    ],
    "src/pages/nosotros.astro": [
        ("tres.productos,", "tres productos,"),
    ],
    "src/pages/sitemap.xml.ts": [
        ('<?xml.version="1.0"', '<?xml version="1.0"'),
        ("http://www sitemaps org/schemas/sitemap/0.9",
         "http://www.sitemaps.org/schemas/sitemap/0.9"),
    ],
}

for relative, reemplazos in FIXES.items():
    path = ROOT / relative
    texto = path.read_text(encoding="utf-8")
    original = texto
    for malo, bueno in reemplazos:
        if malo in texto:
            texto = texto.replace(malo, bueno)
        else:
            print(f"  AVISO  {relative}: no se encontro '{malo[:40]}'")
    if texto != original:
        path.write_text(texto, encoding="utf-8")
        print(f"  OK     {relative}")
