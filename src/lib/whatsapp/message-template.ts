// Texto [PROVISORIO] del mensaje de WhatsApp (docs/reglas-negocio.md, sección 7).
// El cliente puede cambiarlo acá sin tocar el resto del código: cada línea es texto plano
// con marcadores `{nombre}` que se reemplazan con los datos del lead.
//
// Una línea se omite cuando alguno de sus marcadores queda vacío. Así desaparecen las líneas
// de la patente en 0 km, la versión y el GNC en motos, sin ramas en el código.
export const WHATSAPP_MESSAGE_TEMPLATE = [
  "¡Hola! Quiero cotizar un seguro para mi {vehicleKind}.",
  "Solicitud N° {requestNumber}",
  "Nombre: {fullName}",
  "DNI: {dni}",
  "Teléfono: {phone}",
  "Email: {email}",
  "Vehículo: {vehicle}",
  "Patente: {plate}",
  "GNC: {gnc}",
  "Uso: {usage}",
  "Código postal: {postalCode}",
] as const;

const PLACEHOLDER = /\{(\w+)\}/g;

export function renderWhatsappTemplate(values: Record<string, string>): string {
  const lines: string[] = [];

  for (const line of WHATSAPP_MESSAGE_TEMPLATE) {
    let hasEmptyValue = false;
    const rendered = line.replace(PLACEHOLDER, (_match, key: string) => {
      const value = values[key] ?? "";
      if (value === "") hasEmptyValue = true;
      return value;
    });

    if (!hasEmptyValue) lines.push(rendered);
  }

  return lines.join("\n");
}
