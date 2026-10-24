// Contenido e identidad [PROVISORIO] hasta el relevamiento del step 00.
// Los datos del productor se centralizan en content/business.ts.
export const landingContent = {
  brand: "MiSeguro",
  brandSegments: ["Mi", "Seguro"],
  skipLink: "Ir al contenido",
  quoteCta: "Cotizá ahora",
  navigation: [
    { label: "Cómo funciona", href: "/#como-funciona" },
    { label: "Beneficios", href: "/#beneficios" },
    { label: "Ayuda", href: "/#preguntas-frecuentes" },
  ],
  hero: {
    title: "Tu cotización,",
    emphasis: "sin vueltas.",
    description:
      "Encontrá una cobertura para tu vehículo con asesoramiento personalizado. Te acompañamos para que elijas con tranquilidad.",
    secondaryCta: "Conocé cómo funciona",
    highlights: ["Autos y motos", "Atención personalizada", "Contacto por WhatsApp"],
  },
  quote: {
    title: "Tu próxima cobertura empieza acá",
    description: "Un espacio para contarnos sobre tu vehículo y lo que necesitás proteger.",
    vehicleLabel: "Para tu auto o tu moto",
    placeholderTitle: "Próximamente vas a poder cotizar acá",
    placeholderDescription:
      "Estamos preparando el formulario. Por ahora, este espacio no recibe datos ni solicitudes.",
    note: "Después de completar tus datos, un asesor te va a contactar por WhatsApp.",
  },
  process: {
    title: "Un camino simple para elegir tu seguro",
    description: "Conocé cómo va a funcionar la cotización, con una persona acompañándote.",
    steps: [
      {
        title: "Completás tus datos",
        description: "Nos contás qué auto o moto tenés y cómo podemos contactarte.",
      },
      {
        title: "Te contactamos por WhatsApp",
        description: "Un asesor conversa con vos para conocer lo que necesitás.",
      },
      {
        title: "Elegís tu cobertura",
        description: "Revisás las opciones con asesoramiento y elegís la que se adapta a vos.",
      },
    ],
  },
  benefits: {
    title: "Tu vehículo, tus dudas, tu asesor",
    description: "Elegir un seguro también es entender qué estás contratando. Para eso estamos.",
    items: [
      {
        title: "Asesoramiento personalizado",
        description: "Una persona que te escucha y te ayuda a entender las opciones de cobertura.",
      },
      {
        title: "Varias aseguradoras",
        description:
          "Opciones de distintas compañías para evaluar junto a tu asesor, según disponibilidad.",
      },
      {
        title: "Para autos y motos",
        description:
          "Acompañamiento para encontrar una cobertura según tu vehículo y el uso que le das.",
      },
    ],
  },
  trust: {
    title: "Detrás de tu seguro, una persona",
    description:
      "Este espacio va a reunir los datos del productor asesor de seguros y sus canales de contacto.",
    producerLabel: "Productor asesor de seguros",
    reviewsTitle: "Un espacio para sus experiencias",
    reviewsDescription: "Acá vamos a compartir reseñas verificadas cuando estén disponibles.",
  },
  faq: {
    title: "Antes de elegir, sacate las dudas",
    description: "Preguntas frecuentes · Contenido [PROVISORIO] sujeto a confirmación.",
    items: [
      {
        question: "¿Puedo consultar por un auto o una moto?",
        answer:
          "Sí. La propuesta contempla seguros para autos y motos. Un asesor va a ayudarte a evaluar las opciones disponibles para tu vehículo.",
      },
      {
        question: "¿Cómo me van a contactar?",
        answer:
          "Cuando el formulario esté disponible y completes tu consulta, un asesor te va a contactar por WhatsApp al número que indiques.",
      },
      {
        question: "¿Qué datos voy a necesitar?",
        answer:
          "Vas a necesitar información de tu vehículo y un medio de contacto. El formulario va a indicar los datos requeridos cuando esté habilitado.",
      },
      {
        question: "¿Cómo elijo una cobertura?",
        answer:
          "Un asesor te va a explicar las opciones disponibles, sus alcances y sus condiciones para que puedas elegir según lo que necesitás.",
      },
      {
        question: "¿Ya puedo enviar una solicitud desde esta página?",
        answer:
          "Todavía no. Estamos preparando el formulario de cotización. El espacio que ves al inicio es una vista previa y no recibe datos.",
      },
    ],
  },
  footer: {
    description: "Seguros para autos y motos. Una elección acompañada.",
    contactLabel: "Contacto",
    addressLabel: "Dirección",
    privacy: "Privacidad",
  },
} as const;
