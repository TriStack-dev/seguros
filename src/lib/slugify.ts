// Convierte un nombre visible ("Citroën C4 Lounge") en un identificador estable
// ("citroen-c4-lounge"). Lo usan el seed del catálogo y las claves únicas de la base:
// cambiar un nombre visible no tiene que cambiar el slug, porque los leads guardan el id.
const DIACRITICS = /[\u0300-\u036f]/g;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
