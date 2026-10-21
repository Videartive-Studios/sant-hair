/**
 * Textos legales. Contenido de ejemplo: debe ser revisado por un abogado
 * antes de publicar en produccion.
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
    title: 'Politica de privacidad',
    updated: '2026-10-01',
    intro:
      'En Sant Hair+ respetamos tu privacidad. Esta politica explica que datos recogemos, para que los usamos y como puedes ejercer tus derechos.',
    sections: [
      {
        heading: 'Que datos recogemos',
        body: [
          'Cuando realizas un pedido recogemos tu nombre, correo electronico, telefono, direccion de entrega y ciudad. Estos datos son imprescindibles para procesar y enviar tu pedido.',
          'Cuando te suscribes al newsletter o nos escribes desde el formulario de contacto guardamos tu correo electronico, tu nombre y el contenido de tu mensaje.',
        ],
      },
      {
        heading: 'Para que los usamos',
        body: [
          'Usamos tus datos unicamente para gestionar tus pedidos, resolver tus consultas y enviarte comunicaciones comerciales que hayas autorizado. No vendemos ni cedemos tus datos a terceros con fines comerciales.',
        ],
      },
      {
        heading: 'Base de datos y conservacion',
        body: [
          'Los datos de pedidos, suscriptores y mensajes se almacenan en Netlify Blobs, el servicio de almacenamiento de Netlify donde esta alojado este sitio. Los datos de pedidos se conservan durante el tiempo legalmente exigido para poder atender consultas posteriores.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes solicitar en cualquier momento acceso, rectificacion o eliminacion de tus datos escribiendo a contacto@santhair com. Responderemos dentro de los plazos legales previstos.',
        ],
      },
    ],
  },
  {
    slug: 'terminos',
    title: 'Terminos y condiciones',
    updated: '2026-10-01',
    intro:
      'Estos terminos regulan el uso de este sitio y la compra de productos Sant Hair+.',
    sections: [
      {
        heading: 'Sobre los productos',
        body: [
          'Las imagenes de los productos son ilustrativas. Los envases pueden variar ligeramente en tono y acabado sin que esto constituya un cambio sustancial en el producto contratado.',
          'Las formulaciones pueden actualizarse para mejorar su rendimiento. La composicion vigente de cada producto es la que figura en su ficha.',
        ],
      },
      {
        heading: 'Precios y pagos',
        body: [
          'Todos los precios se expresan en pesos colombianos (COP) e incluyen los impuestos aplicables. El precio de cada producto se muestra de forma clara antes de confirmar el pedido.',
          'Los metodos de pago habilitados se muestran durante el proceso de checkout. La confirmacion del pago y del envio se realiza por el canal que selecciones al finalizar la compra.',
        ],
      },
      {
        heading: 'Envios y entrega',
        body: [
          'Los tiempos de entrega son estimados y dependen de la ciudad de destino y de la disponibilidad del transportador. Los pedidos superiores al monto indicadouman en la web cuentan con envio gratuito.',
        ],
      },
      {
        heading: 'Garantia legal',
        body: [
          'Todos los productos cuentan con la garantia legal vigente en Colombia. Ante un producto defectuoso, escribe a contacto@santhair com indicando el numero de pedido y la descripcion del problema.',
        ],
      },
    ],
  },
  {
    slug: 'envios',
    title: 'Politica de envios',
    updated: '2026-10-01',
    intro:
      'Como enviamos tus pedidos, cuanto tarda y cuanto cuesta.',
    sections: [
      {
        heading: 'Cobertura',
        body: [
          'Realizamos envios a todo el territorio nacional y a paises de America Latina. Para destinos internacionales pueden aplicar condiciones y tiempos distintos, que te confirmaremos antes de enviar.',
        ],
      },
      {
        heading: 'Costos y tiempos',
        body: [
          'El envio es gratuito en pedidos superiores al monto indicado en la cabecera del sitio. Por debajo de ese monto se cobra una tarifa fija que se muestra durante el checkout, antes de confirmar el pedido.',
          'Los tiempos de entrega habituales son de 2 a 5 dias habiles en ciudades principales y de 3 a 8 dias habiles en otros municipios.',
        ],
      },
      {
        heading: 'Seguimiento',
        body: [
          'Recibiras la confirmacion del pedido por correo electronico y el numero de guia por WhatsApp en cuanto el paquete sea entregado al transportador.',
        ],
      },
    ],
  },
  {
    slug: 'devoluciones',
    title: 'Cambios y devoluciones',
    updated: '2026-10-01',
    intro:
      'Tu satisfaccion es importante. Estas son las condiciones de cambio y devolucion de Sant Hair+.',
    sections: [
      {
        heading: 'Plazo',
        body: [
          'Tienes 14 dias calendario desde la entrega para solicitar un cambio o una devolucion. El producto debe estar sin uso, con su envase original y sin haber sido abierto.',
        ],
      },
      {
        heading: 'Productos elegibles',
        body: [
          'Por tratarse de productos de cuidado personal e higiene, no se aceptan devoluciones de enveloped productos abiertos o utilizados, salvo que se trate de un defecto de fabricacion o un error en el envio. En ese caso, el costo del envio corre por nuestra cuenta.',
        ],
      },
      {
        heading: 'Como solicitar',
        body: [
          'Escribe a contacto@santhair com con el numero de pedido, el motivo de la solicitud y fotos del producto. Respondemos dentro de 2 dias habiles con las instrucciones y el monto a devolver.',
        ],
      },
    ],
  },
];
