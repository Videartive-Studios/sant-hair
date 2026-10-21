/**
 * Textos legales. Contenido de ejemplo: debe ser revisado por un abogado
 * antes de publicar en producción.
 */

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'privacidad',
    title: 'Política de privacidad',
    updated: '2026-10-01',
    intro:
      'En Sant Hair+ respetamos tu privacidad. Esta política explica qué datos recogemos, para qué los usamos y cómo puedes ejercer tus derechos.',
    sections: [
      {
        heading: 'Qué datos recogemos',
        body: [
          'Cuando realizas un pedido recogemos tu nombre, correo electrónico, teléfono, dirección de entrega y ciudad. Estos datos son imprescindibles para procesar y enviar tu pedido.',
          'Cuando te suscribes al newsletter o nos escribes desde el formulario de contacto guardamos tu correo electrónico, tu nombre y el contenido de tu mensaje.',
        ],
      },
      {
        heading: 'Para qué los usamos',
        body: [
          'Usamos tus datos únicamente para gestionar tus pedidos, resolver tus consultas y enviarte comunicaciones comerciales que hayas autorizado. No vendemos ni cedemos tus datos a terceros con fines comerciales.',
        ],
      },
      {
        heading: 'Base de datos y conservación',
        body: [
          'Los datos de pedidos, suscriptores y mensajes se almacenan en Netlify Blobs, el servicio de almacenamiento de Netlify donde está alojado este sitio. Los datos de pedidos se conservan durante el tiempo legalmente exigido para poder atender consultas posteriores.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes solicitar en cualquier momento acceso, rectificación o eliminación de tus datos escribiendo a contacto@santhair.com. Responderemos dentro de los plazos legales previstos.',
        ],
      },
    ],
  },
  {
    slug: 'terminos',
    title: 'Términos y condiciones',
    updated: '2026-10-01',
    intro:
      'Estos términos regulan el uso de este sitio y la compra de productos Sant Hair+.',
    sections: [
      {
        heading: 'Sobre los productos',
        body: [
          'Las imágenes de los productos son ilustrativas. Los envases pueden variar ligeramente en tono y acabado sin que esto constituya un cambio sustancial en el producto contratado.',
          'Las formulaciones pueden actualizarse para mejorar su rendimiento. La composición vigente de cada producto es la que figura en su ficha.',
        ],
      },
      {
        heading: 'Precios y pagos',
        body: [
          'Todos los precios se expresan en pesos colombianos (COP) e incluyen los impuestos aplicables. El precio de cada producto se muestra de forma clara antes de confirmar el pedido.',
          'Los métodos de pago habilitados se muestran durante el proceso de checkout. La confirmación del pago y del envío se realiza por el canal que selecciones al finalizar la compra.',
        ],
      },
      {
        heading: 'Envíos y entrega',
        body: [
          'Los tiempos de entrega son estimados y dependen de la ciudad de destino y de la disponibilidad del transportador. Los pedidos superiores al monto indicado en la web cuentan con envío gratuito.',
        ],
      },
      {
        heading: 'Garantía legal',
        body: [
          'Todos los productos cuentan con la garantía legal vigente en Colombia. Ante un producto defectuoso, escribe a contacto@santhair.com indicando el número de pedido y la descripción del problema.',
        ],
      },
    ],
  },
  {
    slug: 'envios',
    title: 'Política de envíos',
    updated: '2026-10-01',
    intro:
      'Cómo enviamos tus pedidos, cuánto tarda y cuánto cuesta.',
    sections: [
      {
        heading: 'Cobertura',
        body: [
          'Realizamos envíos a todo el territorio nacional y a países de América Latina. Para destinos internacionales pueden aplicar condiciones y tiempos distintos, que te confirmaremos antes de enviar.',
        ],
      },
      {
        heading: 'Costos y tiempos',
        body: [
          'El envío es gratuito en pedidos superiores al monto indicado en la cabecera del sitio. Por debajo de ese monto se cobra una tarifa fija que se muestra durante el checkout, antes de confirmar el pedido.',
          'Los tiempos de entrega habituales son de 2 a 5 días hábiles en ciudades principales y de 3 a 8 días hábiles en otros municipios.',
        ],
      },
      {
        heading: 'Seguimiento',
        body: [
          'Recibirás la confirmación del pedido por correo electrónico y el número de guía por WhatsApp en cuanto el paquete sea entregado al transportador.',
        ],
      },
    ],
  },
  {
    slug: 'devoluciones',
    title: 'Cambios y devoluciones',
    updated: '2026-10-01',
    intro:
      'Tu satisfacción es importante. Estas son las condiciones de cambio y devolución de Sant Hair+.',
    sections: [
      {
        heading: 'Plazo',
        body: [
          'Tienes 14 días calendario desde la entrega para solicitar un cambio o una devolución. El producto debe estar sin uso, con su envase original y sin haber sido abierto.',
        ],
      },
      {
        heading: 'Productos elegibles',
        body: [
          'Por tratarse de productos de cuidado personal e higiene, no se aceptan devoluciones de productos abiertos o utilizados, salvo que se trate de un defecto de fabricación o un error en el envío. En ese caso, el costo del envío corre por nuestra cuenta.',
        ],
      },
      {
        heading: 'Cómo solicitar',
        body: [
          'Escribe a contacto@santhair.com con el número de pedido, el motivo de la solicitud y fotos del producto. Respondemos dentro de 2 días hábiles con las instrucciones y el monto a devolver.',
        ],
      },
    ],
  },
];
