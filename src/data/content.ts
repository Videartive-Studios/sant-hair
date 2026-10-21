/**
 * Contenido editorial: blog, testimonios y preguntas frecuentes.
 */

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  cover: string;
  author: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-lavar-el-cabello-correctamente',
    title: 'Cómo lavar el cabello correctamente sin dañarlo',
    excerpt:
      'La mayor parte del daño que notas en tu cabello no viene del secador: viene de la forma en que lo lavas. Te revelamos el método correcto.',
    date: '2026-09-18',
    readTime: '6 min',
    category: 'Rutinas',
    cover: '/img/portada-lavar.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'Lavar el cabello parece un paso simple, pero es donde más daño se produce. El agua muy caliente, el shampoo aplicado directamente sobre el cuero cabelludo y el frotado con las uñas son tres prácticas que deterioran la fibra capilar mucho más que una secadora.',
      'El primer cambio es la temperatura. El agua caliente levanta la cutícula y abre el poro, lo que hace que el color se pierda más rápido y que el cabello se seque más poroso. Usa agua tibia y termina el enjuague con agua fría: ayuda a cerrar la cutícula y sella el brillo.',
      'El segundo cambio es la técnica. Nunca pongas el shampoo directo sobre el cabello. Aplícalo primero en las palmas de las manos, emulsiona y distribuye con masajes circulares en el cuero cabelludo usando solo las yemas de los dedos. Las uñas raspan.',
      'Por último, seca presionando, no frotando. Presiona el cabello con una toalla de microfibra o una camiseta de algodón para absorber la humedad sin generar fricción. Cuando el cabello se seca frotando con la toalla, se opaca y se rompe.',
    ],
  },
  {
    slug: 'shampoo-sin-sulfatos-hace-falta',
    title: 'Shampoo sin sulfatos: cuándo hace falta y cuándo no',
    excerpt:
      'No todos los sulfatos son iguales y no todos los cabellos necesitan lo mismo. Una guía honesta para elegir.',
    date: '2026-08-27',
    readTime: '5 min',
    category: 'Ingredientes',
    cover: '/img/portada-sulfatos.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'La etiqueta "sin sulfatos" se ha convertido en el sello de calidad del sector, pero el eslogan esconde una realidad simple: el sulfato de sodio es un limpiador muy potente que reseca. El sulfato de amonio y el cocamidopropil betaina son mucho más suaves.',
      'Por eso el Shampoo Nutritivo Sant Hair+ usa tensioactivos de base vegetal. No se trata de eliminar el concepto, sino de elegir el limpiador adecuado para el tipo de cabello y la frecuencia de lavado.',
      'Si tu cabello es seco, poroso, tratado con color o tiende a la descamación, un shampoo suave marca la diferencia en pocas semanas. Si tienes cabello graso y lavas a diario, un limpiador más potente puede ser necesario, siempre acompañado de un acondicionador que reponga lo que el limpiador se lleva.',
      'La clave está en la constancia, no en el producto de moda. Un régimen suave de cuatro a seis semanas ya muestra resultados: menos frizz, más brillo y un cuero cabelludo mucho más tranquilo.',
    ],
  },
  {
    slug: 'mascarilla-capilar-ritual-semanal',
    title: 'La mascarilla capilar no es un extra: es un ritual semanal',
    excerpt:
      'Saber cuándo, cuánto y cómo usar la mascarilla es la diferencia entre nutrir el cabello y saturarlo.',
    date: '2026-08-05',
    readTime: '4 min',
    category: 'Rutinas',
    cover: '/img/portada-mascarilla.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'La función de la mascarilla capilar es reconstructiva: sellar la cutícula dañada, reponer la humedad interna y devolver al cabello su resistencia mecánica. Por eso su frecuencia no es diaria, sino semanal.',
      'En la Mascarilla Intensiva Sant Hair+ recomendamos una aplicación cada siete días, siempre sobre cabello limpio y escurrido, de la media longitud hacia las puntas. La parte alta del cabello no necesita la concentración completa del producto: el producto debe llegar donde más se necesita.',
      'El tiempo de leave-in también importa. Cinco a diez minutos es el rango habitual. Si tu cabello es muy poroso o ha sido tratado químicamente, puedes dejar actuar la mascarilla toda la noche y lavar al día siguiente.',
      'Un último consejo: alterna el uso de la mascarilla con el del acondicionador. El acondicionador trabaja en la superficie y la mascarilla trabaja en la profundidad. Juntos, en la misma semana, dan el mejor resultado.',
    ],
  },
];

export type Testimonial = {
  name: string;
  city: string;
  rating: number;
  text: string;
  product: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Mariana Restrepo',
    city: 'Medellín',
    rating: 5,
    text:
      'Después de años de decolorar, mi cabello estaba muerto. Con la rutina completa de Sant Hair+ noté diferencia en la tercera semana: el cabello se peinaba solo y por fin volví a sentirlo suave.',
    product: 'Rutina Completa',
  },
  {
    name: 'Carolina Villamil',
    city: 'Bogotá',
    rating: 5,
    text:
      'Tengo cabello finísimo y siempre me da miedo cualquier producto denso. El Acondicionador Suave no me aplasta nada y el frizz desapareció.',
    product: 'Acondicionador Suave',
  },
  {
    name: 'Daniela Ospina',
    city: 'Cali',
    rating: 5,
    text:
      'Me encanta que no sean promesas vacías: aquí los ingredientes están a la vista. La queratina vegetal y el pantenol se notan desde la primera semana.',
    product: 'Shampoo Nutritivo',
  },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: '¿Los productos son aptos para cabello rizado?',
    answer:
      'Sí. Todas las fórmulas de Sant Hair+ libres de sulfatos y siliconas son seguras para el método curly. Recomendamos empezar con el Shampoo Nutritivo, seguido del Acondicionador Suave y, semanalmente, la Mascarilla Intensiva para mantener la hidratación.',
  },
  {
    question: '¿Puedo usarlos con cabello teñido o decolorado?',
    answer:
      'Sí, están pensados para ello. El Shampoo Nutritivo no es agresivo con el color y la Mascarilla Intensiva ayuda a sellar la cutícula que se abre durante la decoloración, lo que reduce la pérdida de color.',
  },
  {
    question: '¿Cuánto tiempo tarda en verse resultados?',
    answer:
      'La textura y el brillo se notan desde el primer lavado. La reparación estructural de la fibra capilar es un proceso: normalmente se perciben resultados claros entre la tercera y la cuarta semana de uso consistente.',
  },
  {
    question: '¿Hacen prueba en animales?',
    answer:
      'No. Todos los productos de Sant Hair+ son cruelty free y no se testean en animales. Nos comprometemos con la trazabilidad de nuestros ingredientes vegetales.',
  },
  {
    question: '¿Cómo realizo mi pedido?',
    answer:
      'Eliges tus productos, completas el formulario de checkout con tus datos de envío y confirmas el pedido. Recibirás la confirmación por correo y el seguimiento de tu pedido por WhatsApp o email según el método de pago que elijas.',
  },
  {
    question: '¿Hacen envíos a todo el país?',
    answer:
      'Sí. Enviamos a todo Colombia y a países de América Latina. El envío es gratis en pedidos superiores a $150.000. Los tiempos de entrega dependen de la ciudad y normalmente son de 2 a 5 días hábiles.',
  },
];
