"""
Recursos graficos derivados de los archivos de marca:

1. Logo circular de Sant Hair+ SIN el fondo negro (version transparente).
2. Logo horizontal dorado sobre fondo blanco (variante para fondos claros).
3. Portadas de blog en 16:10 con el producto COMPLETO, fondo transparente y
   sombra inferior, para que nunca se corte al recortar el marco.
"""
import os

from PIL import Image, ImageFilter

SRC = r"D:\Diana Santamaria\Sant Hair\Logo\Finales"
OUT = r"D:\Diana Santamaria\Sant Hair\Web\public_html\public\img"

# ----------------------------------------------------------------------
# 1. Quitar el fondo negro del logo circular
# ----------------------------------------------------------------------
def quitar_fondo_negro(imagen: Image.Image) -> Image.Image:
    """Elimina el negro conectado al borde (fondo), sin tocar el oro."""
    rgba = imagen.convert("RGBA")
    w, h = rgba.size
    pixeles = rgba.load()

    def es_negro(x, y):
        r, g, b, _ = pixeles[x, y]
        return r < 46 and g < 46 and b < 46

    visita = [[False] * w for _ in range(h)]
    pila = []

    for x in range(w):
        for y in (0, h - 1):
            if not visita[y][x] and es_negro(x, y):
                visita[y][x] = True
                pila.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visita[y][x] and es_negro(x, y):
                visita[y][x] = True
                pila.append((x, y))

    while pila:
        x, y = pila.pop()
        r, g, b, _ = pixeles[x, y]
        pixeles[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visita[ny][nx] and es_negro(nx, ny):
                visita[ny][nx] = True
                pila.append((nx, ny))

    return rgba


print("== Logo circular transparente ==")
circular = Image.open(os.path.join(OUT, "logo-circular.png")).convert("RGBA")
transparente = quitar_fondo_negro(circular)
ruta = os.path.join(OUT, "logo-circular-claro.png")
transparente.save(ruta, "PNG")
print(f"  logo-circular-claro.png  {transparente.size}  {os.path.getsize(ruta) // 1024} KB")

# ----------------------------------------------------------------------
# 2. Logo horizontal dorado sobre blanco
# ----------------------------------------------------------------------
print("== Logo horizontal sobre blanco ==")
horizontal = Image.open(os.path.join(OUT, "logo-horizontal.webp")).convert("RGBA")
placa = Image.new("RGBA", horizontal.size, (255, 255, 255, 255))
placa.alpha_composite(horizontal)
ruta = os.path.join(OUT, "logo-horizontal-blanco.webp")
placa.convert("RGB").save(ruta, "WEBP", quality=95, method=6)
print(f"  logo-horizontal-blanco.webp  {horizontal.size}  {os.path.getsize(ruta) // 1024} KB")

# ----------------------------------------------------------------------
# 3. Portadas de blog (16:10) con el producto completo
# ----------------------------------------------------------------------
print("== Portadas de blog ==")

MEDIDA = (1200, 750)
MARGEN = 0.86  # proporcion maxima que ocupa el producto

PORTADAS = [
    ("portada-lavar.webp", "hero-frascos.webp"),
    ("portada-sulfatos.webp", "producto-shampoo.webp"),
    ("portada-mascarilla.webp", "producto-mascarilla.webp"),
]


def sombra(frasco: Image.Image, alfa: float = 0.34) -> Image.Image:
    difusa = frasco.getchannel("A").filter(ImageFilter.GaussianBlur(14))
    capa = Image.new("RGBA", frasco.size, (26, 22, 17, 0))
    capa.putalpha(difusa.point(lambda v: int(v * alfa)))
    return capa


for nombre, origen in PORTADAS:
    ruta_origen = os.path.join(OUT, origen)
    if not os.path.exists(ruta_origen):
        print(f"  AVISO: falta {origen}")
        continue

    frasco = Image.open(ruta_origen).convert("RGBA")

    # Encajar el producto dentro del marco con margen
    escala = min(
        (MEDIDA[0] * MARGEN) / frasco.width,
        (MEDIDA[1] * MARGEN) / frasco.height,
    )
    nuevo = (
        max(1, int(frasco.width * escala)),
        max(1, int(frasco.height * escala)),
    )
    frasco = frasco.resize(nuevo, Image.LANCZOS)

    lienzo = Image.new("RGBA", MEDIDA, (0, 0, 0, 0))
    x = (MEDIDA[0] - frasco.width) // 2
    y = MEDIDA[1] - frasco.height - int(frasco.height * 0.03)

    lienzo.alpha_composite(sombra(frasco), (x + 4, y + 12))
    lienzo.alpha_composite(frasco, (x, y))

    ruta = os.path.join(OUT, nombre)
    lienzo.save(ruta, "WEBP", quality=92, method=6)
    print(f"  {nombre}  {MEDIDA}  {os.path.getsize(ruta) // 1024} KB")

print("OK")
