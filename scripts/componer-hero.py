"""
Genera la imagen del hero: los tres frascos de la linea Sant Hair+ sobre
fondo transparente, con sombra suave en la base.

La ilustracion original ("Trío SANT HAIR+ en negro y dorado.png") ya viene
recortada con canal alfa y con la sombra horneada, asi que este script solo
la convierte a WebP conservando la transparencia.

El resultado: /img/hero-frascos.webp (WebP con canal alfa).
"""
import os

from PIL import Image

ORIGEN = r"D:\Diana Santamaria\Trío SANT HAIR+ en negro y dorado.png"
OUT = r"D:\Diana Santamaria\Sant Hair\Web\public_html\public\img"

# Lienzo final. Se respeta el encuadre del original (1354x1161) para que la
# relacion de aspecto no cambie respecto a la version anterior del hero.
CANVAS = (1354, 1161)

CALIDAD = 92


def main() -> None:
    if not os.path.exists(ORIGEN):
        print(f"  AVISO: falta el original {ORIGEN}")
        return

    original = Image.open(ORIGEN).convert("RGBA")

    # Si el original cambia de proporcion, se encaja sobre el lienzo previsto.
    if original.size != CANVAS:
        fondo = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        escala = min(CANVAS[0] / original.width, CANVAS[1] / original.height)
        nuevo = original.resize(
            (max(1, int(original.width * escala)), max(1, int(original.height * escala))),
            Image.LANCZOS,
        )
        fondo.alpha_composite(
            nuevo,
            ((CANVAS[0] - nuevo.width) // 2, (CANVAS[1] - nuevo.height) // 2),
        )
        lienzo = fondo
    else:
        lienzo = original

    destino = os.path.join(OUT, "hero-frascos.webp")
    lienzo.save(destino, "WEBP", quality=CALIDAD, method=6)
    print(f"  hero-frascos.webp  {lienzo.size}  {os.path.getsize(destino) // 1024} KB")


if __name__ == "__main__":
    main()
