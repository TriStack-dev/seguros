# Desplazamiento suave y navegación

El layout raíz declara `data-scroll-behavior="smooth"` en `<html>` para que Next.js
pueda desactivar temporalmente el desplazamiento suave durante los cambios de ruta.
Esto evita la advertencia `missing-data-scroll-behavior` sin eliminar el
`scroll-behavior: smooth` existente ni la preferencia de movimiento reducido del CSS.

Para verificarlo con `pnpm dev`, navegá entre páginas mediante enlaces internos y
comprobá que no aparezca esa advertencia en la consola del navegador.

Referencia: [documentación de Next.js](https://nextjs.org/docs/messages/missing-data-scroll-behavior).
