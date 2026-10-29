/**
 * Datos estructurados schema.org dentro del HTML del servidor: Google los lee sin
 * ejecutar JavaScript. `dangerouslySetInnerHTML` es la forma documentada por Next.js
 * para JSON-LD; el `<` se escapa para que ningún valor pueda cerrar el `<script>`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
