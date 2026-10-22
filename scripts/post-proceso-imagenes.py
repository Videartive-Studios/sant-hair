"""
Post-procesado de imagenes de Sant Hair+.

1. Recorta el fondo de las fotos de producto. El fondo es un degradado crema
   suave, asi que se modela por columna (interpolando el borde superior con el
   inferior) y se eliminan los pixeles cercanos a ese modelo. El negro de los
   envases y el dorado de las tapas quedan intactos.
2. Copia el logo horizontal dorado como logo de la cabecera.
"""
import os

from PIL import Image, ImageFilter

SRC = r"D:\Diana Santamaria\Sant Hair\Logo\Finales"
OUT = r"D:\Diana Santamaria\Sant Hair\Web\public_html\public\img"

NEAR = 32.0  # distancia por debajo de la cual el pixel es fondo
FAR = 62.0  # distancia por encima de la cual el pixel es producto


def _median_row(im: Image.Image, rows: range) -> list:
    """Color de fondo por columna, mediana de las filas indicadas."""
    w, h = im.size
    data = im.load()
    out = []
    for x in range(w):
        samples = [data[x, y] for y in rows if 0 <= y < h]
        samples.sort(key=lambda c: sum(c))
        out.append(samples[len(samples) // 2])
    return out


def remove_background(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    data = im.load()

    band = max(2, h // 40)
    top = _median_row(im, range(0, band))
    bottom = _median_row(im, range(h - band, h))

    out = Image.new("RGBA", (w, h))
    dst = out.load()

    for y in range(h):
        t = y / max(1, h - 1)
        for x in range(w):
            bg = tuple(
                top[x][i] + (bottom[x][i] - top[x][i]) * t for i in range(3)
            )
            r, g, b = data[x, y]
            dist = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            if dist <= NEAR:
                alpha = 0
            elif dist >= FAR:
                alpha = 255
            else:
                alpha = int(255 * (dist - NEAR) / (FAR - NEAR))
            dst[x, y] = (r, g, b, alpha)

    # Suavizado suave del canal alpha (1 px) para evitar escalones
    alpha_ch = out.getchannel("A").filter(ImageFilter.GaussianBlur(1))

    # Limpieza final: en la franja inferior la sombra residual (gris claro)
    # se elimina, pero el envase (negro) se conserva intacto.
    alpha_px = alpha_ch.load()
    rgb_px = out.load()
    for y in range(int(h * 0.78), h):
        for x in range(w):
            r, g, b, _ = rgb_px[x, y]
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            if lum > 0.34:
                alpha_px[x, y] = 0

    out.putalpha(alpha_ch)
    return out


def cut_and_save(src: str, box, out_name: str, quality: int = 90) -> None:
    base = Image.open(os.path.join(SRC, src)).convert("RGB").crop(box)
    cut = remove_background(base)
    path = os.path.join(OUT, out_name)
    cut.save(path, "WEBP", quality=quality, method=6)
    print(f"  {out_name:36} {cut.size}  {os.path.getsize(path) // 1024} KB")


print("== Recorte de fondo de productos ==")
SRC_MOCK = "Mockup frascos claro dorado.png"
cut_and_save(SRC_MOCK, (48, 130, 312, 900), "producto-shampoo.webp")
cut_and_save(SRC_MOCK, (330, 90, 652, 900), "producto-acondicionador.webp")
cut_and_save(SRC_MOCK, (678, 375, 975, 895), "producto-mascarilla.webp")

jar = Image.open(os.path.join(SRC, "frasco1.jpg")).convert("RGB")
cut = remove_background(jar)
path = os.path.join(OUT, "mascarilla-detalle.webp")
cut.save(path, "WEBP", quality=90, method=6)
print(f"  {'mascarilla-detalle.webp':36} {cut.size}  {os.path.getsize(path) // 1024} KB")

# ----------------------------------------------------------------------
print("== Logo de cabecera ==")
# El logo de la cabecera es el dorado de marca (Logo-web.webp), no una
# version en tinta: sobre el fondo crema de la cabecera el dorado es el
# color de la marca. La version en tinta se calcula sobre la marcha en
# generar-imagenes-social.py, para la tarjeta de redes.
logo = Image.open(os.path.join(OUT, "logo-horizontal.webp")).convert("RGBA")
path = os.path.join(OUT, "logo-horizontal-ink.webp")
logo.save(path, "WEBP", quality=92, method=6)
print(f"  logo-horizontal-ink.webp  {logo.size}  {os.path.getsize(path) // 1024} KB")

print("OK")

# ----------------------------------------------------------------------
# Tercera fase: componer la imagen del hero (tres frascos con fondo
# transparente y sombra de base).
# ----------------------------------------------------------------------
import runpy

runpy.run_path(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "componer-hero.py"),
    run_name="__main__",
)
