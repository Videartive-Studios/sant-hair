"""
Repara el daño producido por una limpieza erronea: un punto entre dos
letras (X.Y) se habia convertido en un espacio (X Y).

El analisis recorre el archivo entero con un pequeño lector de plantillas
para distinguir tres zonas:

  - codigo            -> se repara (acceso a propiedad: ident.prop)
  - texto de cadena   -> no se toca ('...', "...")
  - texto de plantilla-> no se toca (la parte HTML dentro de `...`)
  - expresion ${...}  -> es codigo, se repara

Reglas de negocio:
  1. Cadenas de texto  -> se repone la extension (.astro, .ts, .webp, .com)
  2. Cadenas conocidas  -> process.env.X, Astro.url.pathname, JSON.stringify...
  3. Acceso a propiedad -> ident.prop, solo si `prop` esta en el vocabulario
                          curado de JavaScript y no es texto plano.
"""
import re
import sys
from pathlib import Path

ROOT = Path(r"D:\Diana Santamaria\Sant Hair\Web\public_html")
SRC = ROOT / "src"
FILES = {".ts", ".tsx", ".astro", ".js", ".mjs"}

KEYWORDS = {
    "const", "let", "var", "return", "delete", "typeof", "new", "await",
    "export", "import", "from", "function", "class", "in", "of", "if",
    "else", "for", "while", "case", "switch", "default", "throw", "yield",
    "do", "try", "catch", "finally", "break", "continue", "as", "void",
    "super", "this", "null", "true", "false", "extends", "implements",
    "interface", "type", "enum", "public", "private", "protected", "static",
    "readonly", "async", "declare", "namespace", "instanceof", "satisfies",
}

PROPS = set(
    """
    map filter find findIndex forEach reduce push pop shift unshift slice
    splice concat join split replace replaceAll trim trimStart trimEnd
    toLowerCase toUpperCase toLocaleString toFixed toString valueOf includes
    indexOf lastIndexOf startsWith endsWith match test sort reverse some
    every keys values entries get set has delete add clear size length then
    catch finally all resolve reject textContent innerHTML innerText classList
    style children childNodes parentNode parentElement firstElementChild
    lastElementChild getAttribute setAttribute removeAttribute hasAttribute
    querySelector querySelectorAll closest matches append appendChild remove
    removeChild dataset id href src alt title value type checked disabled
    placeholder required action method target rel width height path pathname
    search hash hostname origin protocol message slug price stock qty url
    order items total subtotal shipping customer email telefono direccion
    ciudad notas metodoPago currency createdAt status published featured
    category image gallery size badge benefits ingredients howToUse seoTitle
    seoDescription shortDescription subtitle description env meta props params
    site request response cookies redirect body headers json text blob formData
    string
    stringify parse freeze assign isArray Buffer from charAt repeat padStart
    padEnd flat cwd argv exit stdin stdout stderr version platform arch
    execPath hrtime memoryUsage nextTick emit once off removeListener
    readFile writeFile mkdir rename unlink readdir stat access copyFile
    createHmac createHash randomBytes timingSafeEqual update digest
    base64url hex encode decode sign verify publicKey privateKey
    isIntersecting unobserve observe intersectionRatio boundingClientRect
    rootMargin threshold root takeRecords disconnect scrollIntoView smooth
    behavior block inline center nearest auto top left right bottom
    maxDuration animationDelay transitionDelay
    # Nombres de colecciones del sitio
    links link groups group features feature items item categories category
    posts post faqs faq testimonials testimonial collections collection
    products product sections section header footer nav main aside
    # Propiedades CSS manipuladas desde JavaScript
    overflow overflowX overflowY display position transform opacity
    visibility zIndex pointerEvents cursor color background backgroundColor
    margin marginTop marginBottom padding paddingTop border borderRadius
    font fontSize fontWeight lineHeight textAlign justifyContent alignItems
    gap gridTemplateColumns flexDirection flexWrap width height maxWidth
    minWidth maxHeight minHeight boxShadow transition animation filter
    backdropFilter objectFit aspectRatio top left right bottom inset
    scrollTop scrollLeft content max min placeholder
    scrollY scrollX pageYOffset pageXOffset innerWidth innerHeight
    outerWidth outerHeight devicePixelRatio visualViewport screenX screenY
    clientX clientY pageX pageY movementX movementY offsetX offsetY
    relatedTarget inputType dataTransfer selectionStart selectionEnd
    validity willValidate checkValidity reportValidity setCustomValidity
    body
    getItem setItem removeItem clear key getAllKeys
    createElement createTextNode createDocumentFragment createComment
    createEvent getElementById getElementsByClassName getElementsByTagName
    getElementsByName importNode adoptNode cloneNode
    className tabIndex parentNode firstChild lastChild nextSibling
    previousSibling nextElementSibling previousElementSibling attributes
    ownerDocument nodeType nodeName nodeValue tagName isConnected scrollHeight
    offsetHeight offsetWidth clientHeight clientWidth scrollWidth form files
    maxLength readOnly autoComplete multiple selected defaultValue
    defaultChecked crossOrigin decoding referrerPolicy fetchPriority srcSet
    useMap isMap httpEquiv lang dir hidden spellcheck accessKey cellPadding
    cellSpacing colSpan rowSpan scope headers span start reversed label
    formAction formMethod novalidate open async defer textAlign
    fontFamily fontVariant fontStyle letterSpacing lineHeight textTransform
    textIndent verticalAlign whiteSpace wordBreak overflowWrap listStyle
    backgroundImage backgroundSize backgroundPosition backgroundRepeat
    boxSizing borderWidth borderStyle borderColor borderRadius outline
    outlineColor outlineWidth outlineStyle opacity visibility zIndex
    flexBasis flexGrow flexShrink order gridColumn gridRow gap
    flatMap reduceRight random floor ceil round abs min max pow sqrt now
    getTime toISOString getFullYear getMonth getDate format relative
    codePointAt fromCharCode defineProperty getPrototypeOf localeCompare
    preventDefault html arrayBuffer toPrecision toExponential reload
    beforeunload unload print alert confirm prompt clone abort signal
    encodeURIComponent decodeURIComponent searchParams console process window
    document globalThis localStorage sessionStorage fetch Response Request
    Headers FormData URL URLSearchParams Intl Date Math JSON Object Array
    String Number Boolean Promise RegExp Error TypeError Map Set Symbol
    parseInt parseFloat isNaN isFinite setTimeout clearTimeout setInterval
    clearInterval structuredClone TextEncoder TextDecoder credentials
    addEventListener removeEventListener dispatchEvent galleryThumb
    currentTarget stopPropagation metaKey ctrlKey shiftKey altKey button
    clientWidth clientHeight offsetWidth offsetHeight scrollTop scrollLeft
    getBoundingClientRect computedStyle getPropertyValue setProperty toggle
    contains prepend before after replaceWith insertAdjacentHTML scrollIntoView
    focus blur click change input submit reset keydown keyup mousedown mouseup
    mouseenter mouseleave attributes readOnly min max step pattern
    autocomplete spellcheck maxlength minlength loading decoding
    fetchpriority referrerpolicy sizes srcset httpEquiv tabindex hidden
    draggable orderId location ok removeItem addItem setQty getCart clearCart
    cartTotals formatMoney showToast initCart newArrivals activeCategory
    buildUrl sorted reload error warn info log debug trace dir table group
    time timeEnd assert apply call bind prototype constructor stack cause
    readyState statusText base host port content expires NumberFormat
    DateTimeFormat Collator PluralRules RelativeTimeFormat ListFormat
    Segmenter URLPattern
    priority changefreq loc lastmod leido origen asunto mensaje accion
    orderId author excerpt readTime cover question answer rating heading
    updated intro sections date name note notes label key city product
    testimonial feature faq post doc subscriber plan etiqueta modo nombre
    precio cantidad imagen titulo descripcion datos envio estado fecha pedido
    mensajes suscriptores productos unidades ingresos activo pedidos
    stockTotal subscribers orders messages ultimosPedidos recurso
    compareAtPrice featured published stock slug gallery benefits
    ingredients howToUse seoTitle seoDescription shortDescription subtitle
    badge size category image price qty items total subtotal
    freeShippingThreshold shippingCost taxRate brand brandFull tagline
    locale lang phoneDisplay phoneHref whatsapp address currencySymbol
    social announcement code instagram facebook tiktok youtube icon features
    # Claves de dataset (data-*) usadas en el codigo
    orderStatus galleryThumb adminTab newsletterForm newsletterResult
    contactForm contactResult checkoutForm checkoutSummary checkoutResult
    cartBody cartFoot cartCount cartOpen cartClose cartOpenLabel cartDrawer
    cartPageItems cartPageSummary qtyInput qtyMinus qtyPlus adminLogin
    adminLoginResult adminLogout adminStats adminPanel header mobileMenu
    menuOpen menuClose toast pdpMainImage productPublished productPrice
    productStock slug name price image size qty addToCart
    """.split()
)

CHAIN_FIXES = [
    (r"https://wa me/", "https://wa.me/"),
    (r"SITE whatsapp", "SITE.whatsapp"),
    (r"body\?\.style", "body.style"),
    (r"body ([a-zA-Z_$][A-Za-z0-9_$]*)", r"body.\1"),
    (r"process env ([A-Za-z_$][A-Za-z0-9_$]*)", r"process.env.\1"),
    (r"import meta env ([A-Za-z_$][A-Za-z0-9_$]*)", r"import.meta.env.\1"),
    (r"import meta", "import.meta"),
    (r"Astro url pathname", "Astro.url.pathname"),
    (r"Astro url searchParams", "Astro.url.searchParams"),
    (r"Astro url (\w+)", r"Astro.url.\1"),
    (r"Astro response headers", "Astro.response.headers"),
    (r"Astro response (\w+)", r"Astro.response.\1"),
    (r"JSON stringify", "JSON.stringify"),
    (r"JSON parse", "JSON.parse"),
    (r"Promise all", "Promise.all"),
    (r"Promise reject", "Promise.reject"),
    (r"Promise resolve", "Promise.resolve"),
    (r"Math (min|max|round|floor|ceil|abs|pow|sqrt)", r"Math.\1"),
    (r"Object (keys|values|entries|assign|fromEntries)", r"Object.\1"),
    (r"Number (parseFloat|parseInt|isNaN|isFinite)", r"Number.\1"),
    (r"Array (from|isArray|of)", r"Array.\1"),
]

LITERAL_FIXES = [
    (r"(['\"])([^'\"\n]*?) astro\1", r"\1\2.astro\1"),
    (r"(['\"])([^'\"\n]*?) ts\1", r"\1\2.ts\1"),
    (r"(['\"])([^'\"\n]*?) mjs\1", r"\1\2.mjs\1"),
    (r"(['\"])([^'\"\n]*?) js\1", r"\1\2.js\1"),
    (r"(['\"])([^'\"\n]*?) webp\1", r"\1\2.webp\1"),
    (r"(['\"])([^'\"\n]*?) png\1", r"\1\2.png\1"),
    (r"(['\"])([^'\"\n]*?) jpg\1", r"\1\2.jpg\1"),
    (r"(['\"])([^'\"\n]*?) com\1", r"\1\2.com\1"),
    (r"(['\"])([^'\"\n]*?) co\1", r"\1\2.co\1"),
    (r"(['\"])([^'\"\n]*?) css\1", r"\1\2.css\1"),
    (r"(['\"])([^'\"\n]*?) html\1", r"\1\2.html\1"),
    (r"(['\"])([^'\"\n]*?) xml\1", r"\1\2.xml\1"),
]

PAIR_RE = re.compile(
    r"(?<![A-Za-z0-9_$])([A-Za-z_$][A-Za-z0-9_$]*) ([A-Za-z_$][A-Za-z0-9_$]*)"
)

# Caracteres tras los cuales una "/" inicia una expresion regular y no una division.
REGEX_PREV = set("(,=:[!&|?{};+-*%~^<>")
REGEX_KEYWORDS = {
    "return", "typeof", "case", "in", "of", "new", "delete", "void", "do",
    "else", "yield", "await", "instanceof",
}


def is_regex_start(text: str, i: int) -> bool:
    """True si el '/' en la posicion i abre una expresion regular."""
    j = i - 1
    while j >= 0 and text[j] in " \t":
        j -= 1
    if j < 0:
        return True
    ch = text[j]
    if ch in REGEX_PREV:
        return True
    if ch.isalnum() or ch in "_$":
        k = j
        while k >= 0 and (text[k].isalnum() or text[k] in "_$"):
            k -= 1
        return text[k + 1 : j + 1] in REGEX_KEYWORDS
    return False


def skip_regex(text: str, i: int) -> int:
    """i apunta a '/'. Devuelve el indice tras la '/' de cierre."""
    n = len(text)
    j = i + 1
    in_class = False
    while j < n:
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c == "[":
            in_class = True
        elif c == "]":
            in_class = False
        elif c == "/" and not in_class:
            return j + 1
        elif c == "\n":
            return j
        j += 1
    return n


# ----------------------------------------------------------------------
# Analizador de plantillas y cadenas
# ----------------------------------------------------------------------
def scan_template(text: str, i: int, plain: list, expr: list) -> int:
    """i apunta al backtick de apertura. Devuelve el indice tras el cierre."""
    n = len(text)
    j = i + 1
    seg = j
    while j < n:
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c == "`":
            plain.append((seg, j))
            return j + 1
        if c == "$" and j + 1 < n and text[j + 1] == "{":
            plain.append((seg, j))
            end = match_brace(text, j + 1, plain, expr)
            expr.append((j + 2, end))
            j = end + 1
            seg = j
            continue
        j += 1
    plain.append((seg, n))
    return n


def match_brace(text: str, i: int, plain: list, expr: list) -> int:
    """i apunta a '{'. Devuelve el indice del '}' que lo cierra."""
    n = len(text)
    depth = 0
    j = i
    while j < n:
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c in "'\"":
            quote = c
            j += 1
            while j < n:
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == quote:
                    break
                j += 1
            j += 1
            continue
        if c == "`":
            j = scan_template(text, j, plain, expr)
            continue
        if c == "/" and is_regex_start(text, j):
            j = skip_regex(text, j)
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return j
        j += 1
    return n


def analyse(text: str) -> tuple[bytearray, bytearray]:
    """Devuelve (es_texto, es_expresion) por caracter."""
    n = len(text)
    is_plain = bytearray(n)
    is_expr = bytearray(n)
    plain: list = []
    expr: list = []

    i = 0
    while i < n:
        c = text[i]
        if c in "'\"":
            quote = c
            j = i + 1
            while j < n:
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == quote:
                    break
                j += 1
            plain.append((i + 1, j))
            i = j + 1
            continue
        if c == "`":
            i = scan_template(text, i, plain, expr)
            continue
        if c == "/" and is_regex_start(text, i):
            i = skip_regex(text, i)
            continue
        i += 1

    for start, end in plain:
        for k in range(max(0, start), min(end, n)):
            is_plain[k] = 1
    for start, end in expr:
        for k in range(max(0, start), min(end, n)):
            is_expr[k] = 1

    return is_plain, is_expr


# ----------------------------------------------------------------------
# Reparacion
# ----------------------------------------------------------------------
def in_html_tag(prefix: str) -> bool:
    """True si el fragmento esta dentro de una etiqueta HTML (<a href=...>).

    Se cuentan las aperturas de etiqueta ("<" seguido de letra o "/") y los
    cierres (">" que no sean el de una flecha "=>").
    """
    depth = 0
    for m in re.finditer(r"<[A-Za-z/]|>", prefix):
        if m.group(0).startswith("<"):
            depth += 1
        elif depth > 0:
            # un ">" preceded de "=" es una flecha, no un cierre de etiqueta
            if prefix[m.start() - 1 : m.start()] != "=":
                depth -= 1
    return depth > 0


# Palabras del español: nunca son nombres de propiedad. Si aparecen en el
# vocabulario harian falsos positivos dentro del texto de las plantillas.
SPANISH_WORDS = set(
    """
    el la los las un una unos unas de del al y o u e en con sin por para que
    se su sus es son fue ser estar como mas muy no si ya este esta esto ese
    esa todo toda todos todas cada cuando donde porque pero hasta desde
    entre sobre nuestro nuestra tu tus le les lo ha han he hay uso usa usan
    pelo gran aun asi solo bien tan otra otro mismo misma hace menos tambien
    tampoco hacia durante segun tras linea capilar cabello tienda
    envio gratis nunca antes despues puedes queremos creemos necesitas
    merece viene tal quien cual datos correo pedido precio fecha estado
    cantidad pais dia dias ano anos
    hora horas minuto semana semanas mes meses gracias hola adios aqui alla
    pues entonces ahora mientras texto textos color colores brillo textura
    proceso resultados base otros otras parte partes forma cosas manera
    trabajo calidad servicio clientes empresa familia historia experiencia
    equipo ver veras vemos vemos vemos plan planes cosa cosas agua aceite
    aceite cuidado activo activos efecto efectos ayuda ayuda ritual pasos
    paso parte envio gratis hoy manana siempre nunca tambien ademas
    """.split()
)


def dataset_keys(text: str) -> set[str]:
    keys = set()
    for m in re.finditer(r"data-([a-z0-9-]+)", text):
        parts = m.group(1).split("-")
        keys.add(parts[0] + "".join(p.capitalize() for p in parts[1:]))
    return keys


def comment_mask(text: str) -> bytearray:
    """Marca las posiciones que pertenecen a comentarios."""
    n = len(text)
    mask = bytearray(n)
    i = 0
    while i < n:
        if text.startswith("//", i):
            end = text.find("\n", i)
            end = n if end == -1 else end
            for k in range(i, end):
                mask[k] = 1
            i = end
            continue
        if text.startswith("/*", i):
            end = text.find("*/", i + 2)
            end = n if end == -1 else end + 2
            for k in range(i, end):
                mask[k] = 1
            i = end
            continue
        if text.startswith("<!--", i):
            end = text.find("-->", i + 4)
            end = n if end == -1 else end + 3
            for k in range(i, end):
                mask[k] = 1
            i = end
            continue
        i += 1
    return mask


def repair(text: str, extra_props: set[str] | None = None, solo_cadenas: bool = False) -> tuple[str, int]:
    props = (PROPS | extra_props if extra_props else PROPS) - SPANISH_WORDS
    count = 0
    for pattern, repl in LITERAL_FIXES:
        text, n = re.subn(pattern, repl, text)
        count += n
    for pattern, repl in CHAIN_FIXES:
        text, n = re.subn(pattern, repl, text)
        count += n

    if solo_cadenas:
        # Archivos de datos: el texto es prosa y solo se reparan las cadenas.
        return text, count

    # Reposicion de puntos de acceso a propiedad.
    #
    # Un par "ident prop" se considera codigo (y no texto) cuando lo que
    # sigue a "prop" es:
    #   - un operador  ( ) , ; } ] | & ? : < > + - * / !
    #   - una comparacion (==, ===, !=, <=, >=, =>)
    #   - el final de la linea
    #   - otra palabra conocida, lo que indica una cadena de propiedades
    #     (por ejemplo "url searchParams get(...)")
    # Se excluyen las asignaciones ("x ="), que en HTML son atributos.
    replacements: list[int] = []
    search = 0
    comments = comment_mask(text)

    while True:
        match = PAIR_RE.search(text, search)
        if match is None:
            break

        ident, prop = match.group(1), match.group(2)
        start = match.start(1)
        space_index = match.start(2) - 1

        # Los comentarios no son codigo: no se tocan.
        if comments[start]:
            search = start + 1
            continue

        ok = ident not in KEYWORDS and prop in props
        if ok:
            line_start = text.rfind("\n", 0, start) + 1
            # Se incluye el primer caracter del identificador para detectar
            # la apertura de la etiqueta (<BaseLayout title=...>)
            full = text[line_start : start + 1]
            # Si hay una llave abierta sin cerrar, el fragmento que importa
            # es el que va despues de ella: dentro de {...} puede haber HTML
            # (por ejemplo {condicion && <meta name="..." />}).
            depth = 0
            cut = 0
            for idx, ch in enumerate(full):
                if ch == "{":
                    depth += 1
                    cut = idx + 1
                elif ch == "}":
                    depth -= 1
                    if depth <= 0:
                        depth = 0
                        cut = idx + 1
            prefix = full[cut:]
            # "import x from 'y'" no es un acceso a propiedad
            if "import " in prefix or "export " in prefix:
                ok = False
            # Dentro de una etiqueta HTML los pares son atributos, no codigo
            elif in_html_tag(prefix):
                ok = False
        if ok:
            rest = text[match.end(2) :]
            stripped = rest.lstrip(" \t")
            if not stripped or stripped[0] == "\n":
                pass  # fin de linea
            elif stripped[0] in "()[]{};,|&?:<>+-*/!.@#":
                pass  # operador
            elif stripped.startswith(("==", "!=", "<=", ">=", "=>")):
                pass  # comparacion
            elif stripped[0] == "=":
                # Asignacion a una propiedad ("panelEl.innerHTML = ...").
                # Los atributos HTML ya quedan fuera por in_html_tag.
                pass
            elif re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", stripped) and re.match(
                r"[A-Za-z_$][A-Za-z0-9_$]*", stripped
            ).group(0) in props | {"as", "in", "of", "instanceof"}:
                pass  # cadena de propiedades o operadores de tipo
            else:
                ok = False  # prosa

        if ok:
            replacements.append(space_index)
            search = match.start(2)
        else:
            search = start + 1

    for space_index in sorted(replacements, reverse=True):
        text = text[:space_index] + "." + text[space_index + 1 :]

    return text, count + len(replacements)


def main() -> None:
    apply = "--fix" in sys.argv
    total = 0
    targets = [p for p in sorted(SRC.rglob("*")) if p.suffix in FILES and not p.is_dir()]
    targets += [ROOT / "astro.config.mjs", ROOT / "netlify.toml"]
    for path in targets:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        solo_cadenas = "data" in path.parts
        fixed, n = repair(text, dataset_keys(text), solo_cadenas)
        if n:
            total += n
            print(f"  {path.relative_to(ROOT)}: {n}")
            if apply:
                path.write_text(fixed, encoding="utf-8")
    print("total:", total)


if __name__ == "__main__":
    main()
