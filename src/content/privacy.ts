import { business } from "@/content/business";

// Borrador editorial: reemplazar por el texto aprobado por el cliente en el step 00.
export const privacyContent = {
  title: "Política de privacidad",
  introduction:
    "Conocé qué información se prevé usar para gestionar tu solicitud de seguro y cómo podés ejercer tus derechos sobre tus datos.",
  draft: true,
  draftTitle: "Borrador pendiente de validación legal",
  draftDescription:
    "Este texto y los datos del responsable son provisorios. El cliente debe confirmar los canales de contacto, el plazo de conservación y aprobar la política antes del lanzamiento.",
  sections: [
    {
      id: "responsable",
      title: "Quién es responsable de tus datos",
      paragraphs: [
        `El responsable previsto es ${business.legalName}, con domicilio en ${business.address}. El productor asesor es ${business.producerName}, ${business.license}.`,
        `Contacto previsto: ${business.email}. Teléfono: ${business.phone}. Horario: ${business.hours}. ${business.provisionalNote}`,
      ],
    },
    {
      id: "datos",
      title: "Qué información se recolecta",
      paragraphs: [
        "El formulario de cotización prevé solicitar nombre y apellido, DNI, teléfono, email y código postal, junto con los datos del vehículo: tipo, patente cuando corresponda, marca, modelo, versión, año, uso y GNC para autos.",
        "También se prevé registrar la fecha del consentimiento, el número y seguimiento de la solicitud, el origen de la visita (campaña, UTM, gclid y página de entrada) y la apertura del enlace a WhatsApp. Los controles contra envíos abusivos se incorporarán antes de habilitar el envío.",
        "El formulario todavía está en preparación: la vista previa de la landing no recibe solicitudes ni datos personales.",
      ],
    },
    {
      id: "finalidad",
      title: "Para qué se usan tus datos",
      paragraphs: [
        "La finalidad prevista es gestionar tu solicitud, evaluar opciones de seguro y contactarte por teléfono, email o WhatsApp para continuar la cotización. El seguimiento permite saber en qué etapa está tu consulta y elaborar estadísticas del servicio.",
        "Antes de enviar la solicitud vas a tener que aceptar esta política. Los campos obligatorios se indicarán en el formulario; sin esos datos no se podrá gestionar la consulta.",
      ],
    },
    {
      id: "destinatarios",
      title: "Con quién se comparten",
      paragraphs: [
        "Se prevé que accedan el productor asesor y las personas autorizadas para atender tu consulta. Los datos necesarios podrán compartirse con aseguradoras para solicitar una cotización, y con proveedores tecnológicos que permitan prestar el servicio, sujetos a las condiciones aplicables de protección de datos.",
        "Si decidís continuar por WhatsApp, el mensaje precargado incluirá tus datos y los del vehículo. Vos elegís enviarlo; el uso de esa plataforma también está sujeto a sus propias condiciones y política de privacidad. Los proveedores, destinos y eventuales transferencias internacionales deben confirmarse en la versión definitiva.",
      ],
    },
    {
      id: "conservacion",
      title: "Durante cuánto tiempo se conservan",
      paragraphs: [
        "El criterio previsto es conservar la información solo durante el tiempo necesario para atender la solicitud y cumplir las obligaciones legales aplicables. Cuando deje de ser necesaria, corresponderá eliminarla o anonimizarla, salvo que exista una obligación de conservación.",
        "[PROVISORIO] El plazo concreto, su inicio y el procedimiento de eliminación están pendientes de definición y validación por el cliente. Este borrador no establece un plazo definitivo ni implica que ya exista un borrado automático.",
      ],
    },
    {
      id: "derechos",
      title: "Tus derechos y cómo ejercerlos",
      paragraphs: [
        "La Ley 25.326 reconoce el derecho a conocer los datos personales que se tienen sobre vos y solicitar su rectificación, actualización o, cuando corresponda, supresión. Podés pedir información al responsable e indicar qué datos querés consultar o corregir.",
        `El canal previsto para estos pedidos es ${business.email}, o una presentación en ${business.address}. Identificá tu solicitud e indicá un medio para recibir la respuesta; el responsable deberá verificar tu identidad de forma adecuada. Estos canales son ejemplos y deben reemplazarse por los reales antes del lanzamiento.`,
      ],
    },
    {
      id: "autoridad",
      title: "Autoridad de control",
      paragraphs: [
        "La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la Ley 25.326. Podés acudir a ella para obtener orientación o presentar reclamos y denuncias relacionados con la protección de tus datos personales.",
      ],
    },
  ],
  sources: [
    {
      label: "Conocé tus derechos en la AAIP",
      href: "https://www.argentina.gob.ar/aaip/datospersonales/derechos",
    },
    {
      label: "Consultá la Ley 25.326",
      href: "https://www.argentina.gob.ar/normativa/nacional/64790/actualizacion",
    },
  ],
} as const;
