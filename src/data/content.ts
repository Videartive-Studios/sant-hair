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
    title: 'Como lavar el cabello correctamente sin danarlo',
    excerpt:
      'La mayor parte del dano que notas en tu cabello no viene del secador: viene de la forma en que lo lavas. Te revelamos el metodo correcto.',
    date: '2026-09-18',
    readTime: '6 min',
    category: 'Rutinas',
    cover: '/img/portada-lavar.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'Lavar el cabello parece un paso simple, pero es donde mas dano se produce. El agua muy caliente, el shampoo aplicado directamente sobre el cuero cabelludo y el frotado con las unas son tres practicas que deterioran la fibra capilar mucho mas que una secadora.',
      'El primer cambio es la temperatura. El agua caliente levanta la cuticula y abre el poro, lo que hace que el color se pierda mas rapido y que el cabello se seque mas poroso. Usa agua tibia y termina el enjuague con agua fria: ayuda a cerrar la cuticula y sella el brillo.',
      'El segundo cambio es la tecnica. Nunca pongas el shampoo directo sobre el cabello. Aplicalo primero en las palmas de las manos, emulsiona y distribuye con masajes circulares en el cuero cabelludo usando solo las yemas de los dedos. Las unas raspan.',
      'Por ultimo, seca presionando, no frotando. Presiona el cabello con una toalla de microfibra o una camiseta de algodon para absorber la humedad sin generar friccion. Cuando el cabello se seca frotando con la toalla, se opaca y se rompe.',
    ],
  },
  {
    slug: 'shampoo-sin-sulfatos-hace-falta',
    title: 'Shampoo sin sulfatos: cuando hace falta y cuando no',
    excerpt:
      'No todos los sulfatos son iguales y no todos los cabellos necesitan lo mismo. Una guia honesta para elegir.',
    date: '2026-08-27',
    readTime: '5 min',
    category: 'Ingredientes',
    cover: '/img/portada-sulfatos.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'La etiqueta sin sulfatos se ha convertido en el sello de calidad del sector, pero el slogan esconde una realidad simple: el sulfato de sodio es un limpiador muy potente que reseca. El sulfato de amonio y el cocamidopropil betaina son mucho mas suaves.',
      'Por eso el Shampoo Nutritivo Sant Hair+ usa tensioactivos de base vegetal. No se trata de eliminar el concepto, sino de elegir el limpiador adecuado para el tipo de cabello y la frecuencia de lavado.',
      'Si tu cabello es seco, poroso, tratado con color o tiende a la descamacion, un shampoo suave marca la diferencia en pocas semanas. Si tienes cabello graso y lavas a diario, un limpiador mas potente puede ser necesario, siempre acompañado de un acondicionador que reponga lo que el limpiador se lleva.',
      'La clave esta en la constancia, no en el producto de moda. Un regimen suave de cuatro a seis semanas ya muestra resultados: menos frizz, mas brillo y un cuero cabelludo mucho mas tranquilo.',
    ],
  },
  {
    slug: 'mascarilla-capilar-ritual-semanal',
    title: 'La mascara capilar no es un extra: es un ritual semanal',
    excerpt:
      'Saber cuando, cuanto y como usar la mascarilla es la diferencia entre nutrir el cabello y saturarlo.',
    date: '2026-08-05',
    readTime: '4 min',
    category: 'Rutinas',
    cover: '/img/portada-mascarilla.webp',
    author: 'Equipo Sant Hair+',
    content: [
      'La funcion de la mascara capilar es reconstructiva: sellar la cuticula danada, reponer la humedad interna y devolver al cabello su resistencia mecanica. Por eso su frecuencia no es diaria, sino semanal.',
      'En la Mascarilla Intensiva Sant Hair+ recomendamos una aplicacion cada siete dias, siempre sobre cabello limpio y escurrido, de la media longitud hacia las puntas. La parte alta del cabello no necesita la concentracion completa del producto: el producto debe llegar donde mas se necesita.',
      'El tiempo de leave-in tambien importa. Cinco a diez minutos es el rango habitual. Si tu cabello es muy poroso o ha sido tratado quimicamente, puedes dejar actuar la mascarilla toda la noche y lavar al dia siguiente.',
      'Un ultimo consejo: alterna el uso de la mascarilla con el del condicionador. El condicionador trabaja en la superficie y la mascarilla trabaja en la profundidad. Juntos, en la misma semana, dan el mejor resultado.',
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
    city: 'Medellin',
    rating: 5,
    text:
      'Despues de anos de decolorar, mi cabello estaba muerto. Con la rutina completa de Sant Hair+ note diferencia en la tercera semana: el cabello se peinaba solo y por fin volvi a sentirlo suave.',
    product: 'Rutina Completa',
  },
  {
    name: 'Carolina Villamil',
    city: 'Bogota',
    rating: 5,
    text:
      'Tengo cabello finissimo y siempre me da miedo cualquier producto denso. El acondicionador Suave no me aplasta nada y el frizz desaparecio.',
    product: 'Acondicionador Suave',
  },
  {
    name: 'Daniela Ospina',
    city: 'Cali',
    rating: 5,
    text:
      'Me encanta que no sean promesas vacias: aqui los ingredientes estan a la vista. La keratina vegetal y el pantenol se notan desde la primera semana.',
    product: 'Shampoo Nutritivo',
  },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: '¿Los productos son aptos para cabello rizado?',
    answer:
      'Si. Todas las formulas de Sant Hair+ libres de sulfatos y siliconas son seguras para el metodo curly. Recomendamos empezar con el Shampoo Nutritivo, seguido de Acondicionador Suave y semanalmente la Mascarilla Intensiva para mantener la hidratacion.',
  },
  {
    question: '¿Puedo usarlos con cabello teñido o decolorado?',
    answer:
      'Si, estan pensados para ello. El Shampoo Nutritivo no es aggressive con el color y la Mascarilla Intensiva ayuda a sellar la cuticula que se abre durante la decoloracion, lo que reduce la perdida de color.',
  },
  {
    question: '¿Cuanto tiempo tarda en verse resultados?',
    answer:
      'La textura y el brillo se notan desde el primer lavado. La reparacion estructural de la fibra capilar es un proceso: normalmente se perciben resultados claros entre la tercera y la cuarta semana de uso consistente.',
  },
  {
    question: '¿Hacen prueba en animales?',
    answer:
      'No. Todos los productos de Sant Hair+ son cruelty free y no se testean en animales. Nos comprometemos con la trazabilidad de nuestros ingredientes vegetales.',
  },
  {
    question: '¿Como realizo mi pedido?',
    answer:
      'Eliges tus productos, completas el formulario de checkout con tus datos de envio y confirmas el pedido. Recibiras la confirmacion por correo y el seguimiento de tu pedido por WhatsApp o email segun el metodo de pago que elijas.',
  },
  {
    question: '¿Hacen envios a todo el pais?',
    answer:
      'Si. Enviamos a todo Colombia y a paises de America Latina. El envio es gratis en pedidos superiores a $150.000. Los tiempos de entrega dependen de la ciudad y normalmente son de 2 a 5 dias habiles.',
  },
];
