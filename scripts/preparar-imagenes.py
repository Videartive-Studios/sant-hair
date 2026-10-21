"""
Procesa los assets de la marca Sant Hair+ para la web.
Recorta cada presentacion de los mockups y genera versiones web optimizadas.
"""
import os
from PIL import Image

SRC = r"D:\Diana Santamaria\Sant Hair\Logo\Finales"
OUT = r"D:\Diana Santamaria\Sant Hair\Web\public_html\public\img"
os.makedirs(OUT, exist_ok=True)


def save(im, name, quality=82, max_w=None):
    if max_w and im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    if name.endswith(".webp"):
        im.save(os.path.join(OUT, name), "WEBP", quality=quality, method=6)
    else:
        im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print(f"  {name:38} {im.size[0]}x{im.size[1]}  {os.path.getsize(os.path.join(OUT, name))//1024} KB")


print("== Mockup claro (fondo crema) ==")
light = Image.open(os.path.join(SRC, "Mockup frascos claro dorado.png")).convert("RGB")
print("  base:", light.size)

# Recortes sobre el mockup claro 1024x1024
crops = {
    "producto-shampoo.webp":       (48, 130, 312, 900),
    "producto-acondicionador.webp": (330, 90, 652, 900),
    "producto-mascarilla.webp":     (652, 375, 975, 895),
}
for name, box in crops.items():
    save(light.crop(box), name, quality=86)

print("== Mockup negro (dramatico) ==")
black = Image.open(os.path.join(SRC, "Mockupo frascos negros.png")).convert("RGB")
print("  base:", black.size)
save(black, "mockup-negro.webp", quality=84, max_w=1400)

black2 = Image.open(os.path.join(SRC, "Mockup Sant Hair 2.png")).convert("RGB")
save(black2, "mockup-negro-hoja.webp", quality=84, max_w=1400)

black3 = Image.open(os.path.join(SRC, "Mockup frascos negros dorados.png")).convert("RGB")
save(black3, "mockup-negro-2.webp", quality=84, max_w=1400)

light_full = Image.open(os.path.join(SRC, "Mockup frascos claro dorado.webp")).convert("RGB")
# Recorte vertical: el mockup original tiene mucho aire arriba y abajo.
light_full = light_full.crop((20, 78, 1004, 922))
save(light_full, "mockup-claro.webp", quality=86, max_w=1600)

print("== Logos ==")
save(Image.open(os.path.join(SRC, "Logo-web.webp")).convert("RGBA"), "logo-horizontal.webp", quality=92)
save(Image.open(os.path.join(SRC, "Logo transparente.png")).convert("RGBA"), "logo-horizontal.png")
save(Image.open(os.path.join(SRC, "logo.png")).convert("RGBA"), "logo-vertical.png")
save(Image.open(os.path.join(SRC, "Mesa de trabajo 1.png")).convert("RGBA"), "logo-circular.png")
save(Image.open(os.path.join(SRC, "frasco1.jpg")).convert("RGB"), "mascarilla-detalle.webp", quality=88)

print("== Favicons ==")
save(Image.open(os.path.join(SRC, "favicon.webp")).convert("RGBA"), "favicon.webp", quality=92)
save(Image.open(os.path.join(SRC, "favicon-blanco.webp")).convert("RGBA"), "favicon-blanco.webp", quality=92)

print("OK ->", OUT)

# ----------------------------------------------------------------------
# Segunda fase: quitar el fondo a las fotos de producto y generar el
# logo en tinta. Se ejecuta aqui para que el orden sea siempre correcto.
# ----------------------------------------------------------------------
import runpy

runpy.run_path(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "post-proceso-imagenes.py"),
    run_name="__main__",
)
