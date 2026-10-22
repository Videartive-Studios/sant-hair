"""
Genera las imagenes que el sitio necesita y que no llegan bien en WebP:

  - public/img/og-santhair.png       (1200x630) imagen para tarjetas de redes
  - public/img/apple-touch-icon.png  (180x180)  icono para iOS

Facebook, Twitter y LinkedIn no interpretan WebP en `og:image`, asi que la
imagen de portada tiene que ser PNG o JPG.

Uso:  python scripts/generar-imagenes-social.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "img"

CREMA = (246, 242, 234)
ORO = (201, 174, 104)
TINTA = (11, 11, 10)


def _fit(im: Image.Image, box: int) -> Image.Image:
    """Encaja la imagen dentro de un cuadrado sin deformarla."""
    copia = im.copy()
    copia.thumbnail((box, box), Image.LANCZOS)
    return copia


def logo_en_tinta(logo: Image.Image) -> Image.Image:
    """Convierte el logo dorado en una version de tinta oscura.

    La cabecera usa el logo dorado de marca, pero sobre el fondo crema de la
    tarjeta de redes el dorado no tiene contraste: ahi se usa la version en
    tinta, que se calcula aqui a partir del original.
    """
    w, h = logo.size
    pixels = logo.load()

    top_c = (24, 22, 18)
    bottom_c = (78, 71, 57)

    out = Image.new("RGBA", (w, h))
    dst = out.load()
    for y in range(h):
        t = y / max(1, h - 1)
        color = tuple(top_c[i] + (bottom_c[i] - top_c[i]) * t for i in range(3))
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            factor = 0.6 + 0.6 * lum
            dst[x, y] = (
                min(255, round(color[0] * factor)),
                min(255, round(color[1] * factor)),
                min(255, round(color[2] * factor)),
                a,
            )

    return ImageEnhance.Contrast(out).enhance(1.06)


def generar_og(destino: Path) -> None:
    """Tarjeta 1200x630: fondo crema, marca y la linea de producto."""
    W, H = 1200, 630
    lienzo = Image.new("RGB", (W, H), CREMA)
    dibujo = ImageDraw.Draw(lienzo)

    # Degradado vertical muy suave para que no se vea plano.
    for y in range(H):
        t = y / H
        color = (
            int(CREMA[0] * (1 - t) + 248 * t),
            int(CREMA[1] * (1 - t) + 244 * t),
            int(CREMA[2] * (1 - t) + 236 * t),
        )
        dibujo.line([(0, y), (W, y)], fill=color)

    # Marco dorado interior.
    dibujo.rectangle([28, 28, W - 29, H - 29], outline=ORO, width=2)

    # Logotipo centrado arriba, en tinta para que contraste con el crema.
    logo = logo_en_tinta(Image.open(IMG / "logo-horizontal.webp").convert("RGBA"))
    logo = _fit(logo, 420)
    lienzo.paste(logo, ((W - logo.width) // 2, 92), logo)

    # Linea de producto al pie, con sombra suave.
    foto = Image.open(IMG / "mockup-claro.webp").convert("RGBA")
    foto = _fit(foto, 400)
    sombra = Image.new("RGBA", foto.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).ellipse(
        [foto.width * 0.12, foto.height * 0.82, foto.width * 0.88, foto.height * 0.97],
        fill=(11, 11, 10, 46),
    )
    sombra = sombra.filter(ImageFilter.GaussianBlur(9))

    x = (W - foto.width) // 2
    y = 232
    lienzo.paste(sombra, (x, y + 16), sombra)
    lienzo.paste(foto, (x, y), foto)

    # Etiqueta inferior.
    etiqueta = "SHAMPOO · ACONDICIONADOR · MASCARILLA"
    try:
        from PIL import ImageFont

        fuente = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        fuente = None
    caja = dibujo.textbbox((0, 0), etiqueta, font=fuente)
    ancho = caja[2] - caja[0]
    dibujo.text(
        ((W - ancho) // 2, H - 74),
        etiqueta,
        fill=TINTA if fuente else (60, 55, 45),
        font=fuente,
    )

    lienzo.save(destino, "PNG", optimize=True)
    print("generado:", destino.relative_to(ROOT), lienzo.size)


def generar_apple_touch(destino: Path) -> None:
    """Icono 180x180 opaco: iOS no acepta WebP ni transparencia."""
    base = Image.open(IMG / "favicon.webp").convert("RGBA")
    base = _fit(base, 180)

    lienzo = Image.new("RGBA", (180, 180), TINTA)
    lienzo.alpha_composite(
        base,
        ((180 - base.width) // 2, (180 - base.height) // 2),
    )
    fondo = Image.new("RGB", (180, 180), TINTA)
    fondo.paste(lienzo, (0, 0), lienzo)
    fondo.save(destino, "PNG", optimize=True)
    print("generado:", destino.relative_to(ROOT), fondo.size)


if __name__ == "__main__":
    generar_og(IMG / "og-santhair.png")
    generar_apple_touch(IMG / "apple-touch-icon.png")
