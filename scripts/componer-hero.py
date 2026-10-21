"""
Compone la imagen del hero: los tres frascos de la linea Sant Hair+ sobre
fondo transparente, con sombra suave en la base.

En lugar de recortar el mockup (que arrastra el fondo crema y su sombra
original), se reutilizan los tres recortes ya limpios que genera
post-proceso-imagenes.py y se vuelven a componer en su posicion original.

El resultado: /img/hero-fraccos.webp (WebP con canal alfa).
"""
import os

from PIL import Image, ImageFilter

OUT = r"D:\Diana Santamaria\Sant Hair\Web\public_html\public\img"

# Lienzo: el mismo encuadre que mockup-claro.webp
# (recorte 20,78 -> 1004,922 del mockup original de 1024x1024).
CANVAS = (984, 844)
ORIGEN = (20, 78)

# Posicion de cada frasco: (archivo de recorte, caja en el mockup 1024x1024)
FRASCOS = [
    ("producto-shampoo.webp", (48, 130, 312, 900)),
    ("producto-acondicionador.webp", (330, 90, 652, 900)),
    ("producto-mascarilla.webp", (678, 375, 975, 895)),
]

SOMBRA_DESPLAZAMIENTO = (7, 18)
SOMBRA_DESVANEZADO = 14
SOMBRA_OPACIDAD = 0.55
SUELO_OMBRA_OPACIDAD = 0.22

# El recorte deja un velo de pixeles casi transparentes en el fondo. Se
# "endurece" el canal alfa para que la sombra no herede esa forma.
VELO = 34
TRANSICION = 110


def endurecer_alfa(frasco: Image.Image) -> Image.Image:
    """Elimina el velo residual y deja un borde limpio."""
    alfa = frasco.getchannel("A").point(
        lambda v: 0 if v <= VELO else min(255, int((v - VELO) * 255 / TRANSICION))
    )
    limpio = frasco.copy()
    limpio.putalpha(alfa)
    return limpio


def sombra_frasco(frasco: Image.Image) -> Image.Image:
    """Silueta difusa del frasco, desplazada hacia abajo."""
    difusa = frasco.getchannel("A").filter(ImageFilter.GaussianBlur(SOMBRA_DESVANEZADO))
    sombra = Image.new("RGBA", frasco.size, (26, 22, 17, 0))
    sombra.putalpha(difusa.point(lambda v: int(v * SOMBRA_OPACIDAD)))
    return sombra


def sombra_suelo(ancho: int, alto: int) -> Image.Image:
    """Elipse muy difusa bajo el conjunto de frascos."""
    capa = Image.new("RGBA", (ancho, alto), (0, 0, 0, 0))
    pixeles = capa.load()
    cx = ancho // 2
    cy = alto - 34
    rx = int(ancho * 0.30)
    ry = 20
    for y in range(max(0, cy - ry * 4), min(alto, cy + ry * 4)):
        for x in range(max(0, cx - rx * 2), min(ancho, cx + rx * 2)):
            dx = (x - cx) / rx
            dy = (y - cy) / ry
            d = dx * dx + dy * dy
            if d < 1:
                alpha = int(255 * SUELO_OMBRA_OPACIDAD * (1 - d) ** 1.4)
                pixeles[x, y] = (26, 22, 17, alpha)
    return capa.filter(ImageFilter.GaussianBlur(12))


def main() -> None:
    lienzo = Image.new("RGBA", CANVAS, (0, 0, 0, 0))

    # La sombra de suelo va al fondo de todo
    lienzo.alpha_composite(sombra_suelo(*CANVAS))

    for nombre, caja in FRASCOS:
        ruta = os.path.join(OUT, nombre)
        if not os.path.exists(ruta):
            print(f"  AVISO: falta {nombre}")
            continue

        frasco = endurecer_alfa(Image.open(ruta).convert("RGBA"))
        x = caja[0] - ORIGEN[0]
        y = caja[1] - ORIGEN[1]

        lienzo.alpha_composite(
            sombra_frasco(frasco),
            (x + SOMBRA_DESPLAZAMIENTO[0], y + SOMBRA_DESPLAZAMIENTO[1]),
        )
        lienzo.alpha_composite(frasco, (x, y))

    destino = os.path.join(OUT, "hero-fraccos.webp")
    lienzo.save(destino, "WEBP", quality=92, method=6)
    print(f"  hero-fraccos.webp  {lienzo.size}  {os.path.getsize(destino) // 1024} KB")


if __name__ == "__main__":
    main()
