# Step 05 — Seed del catálogo de vehículos

**Etapa:** 1. Base · **Depende de:** 04 · **Leer:** `docs/reglas-negocio.md` sección 1 (marca y modelo)

## Objetivo

Cargar en la base un catálogo de marcas y modelos de autos y motos que se venden en Argentina, lo más amplio posible, para que el formulario use listas en lugar de texto libre.

## Contexto

No existe una fuente gratuita y completa (las bases completas, como InfoAuto, son pagas). El catálogo es propio, se guarda versionado en el repo y es [PROVISORIO]: la estructura tiene que permitir ampliarlo o reemplazarlo después por una fuente paga sin tocar el resto del sistema. Siempre existe la opción "Otro" en el formulario (no se guarda en el catálogo).

## Tareas

- [ ] Armar `prisma/seed/vehicles.json` con esta estructura:
  ```json
  {
    "version": "2026-10-20",
    "sources": ["descripción de cada fuente usada"],
    "AUTO": [{ "name": "Fiat", "models": ["Cronos", "Argo", "Strada", "..."] }],
    "MOTO": [{ "name": "Honda", "models": ["Wave 110", "CG 150 Titan", "..."] }]
  }
  ```
- [ ] Contenido: marcas y modelos **comercializados en Argentina** en los últimos ~25 años, priorizando los más patentados.
  - Fuentes sugeridas: rankings de patentamientos de ACARA (autos) y de motos (ACARA División Motovehículos / SIOMAA), sitios de las marcas y catálogos de concesionarias. Si el agente no tiene acceso web, armar el catálogo desde su conocimiento e indicarlo en `sources`.
  - Autos: al menos **40 marcas**, con todos sus modelos de línea conocidos (por ejemplo Fiat, Volkswagen, Chevrolet, Ford, Toyota, Renault, Peugeot, Citroën, Nissan, Honda, Jeep, Hyundai, Kia, BAIC, Chery, BYD, RAM, Mercedes-Benz, BMW, Audi, etc.).
  - Motos: al menos **30 marcas**, incluidas las nacionales y de ensamble local (Honda, Yamaha, Motomel, Gilera, Corven, Zanella, Keller, Mondial, Bajaj, Guerrero, Brava, Beta, TVS, Suzuki, Kawasaki, Benelli, KTM, Royal Enfield, Voge, CFMoto, Hero, Siambretta, BMW, Harley-Davidson, Triumph, Ducati, etc.).
  - Modelos **sin año ni versión**; la versión la escribe el usuario. Variantes muy distintas sí van separadas ("Hilux", "SW4").
  - Nombres con la grafía oficial de la marca, sin duplicados, ordenados alfabéticamente.
- [ ] `prisma/seed/seed.ts`: lee el JSON y hace **upsert** por `(vehicleType, slug)` en marcas y `(brandId, slug)` en modelos. Correrlo varias veces no duplica nada. No borra marcas ni modelos que ya no estén en el JSON (pueden tener leads asociados); los informa por consola.
- [ ] Función `slugify` en `src/lib/` (minúsculas, sin acentos, guiones) con test.
- [ ] Test unitario `prisma/seed/vehicles.test.ts` (o en `src/lib/`) que valide el JSON: estructura correcta, mínimos de marcas, sin marcas ni modelos duplicados por slug, ninguna marca sin modelos.
- [ ] Script `db:seed` en `package.json` y configuración de seed de Prisma.
- [ ] Documentar en el README cómo actualizar el catálogo (editar el JSON, cambiar `version`, correr `pnpm db:seed` en cada entorno).

## Criterios de aceptación

- `pnpm db:seed` carga el catálogo en `miseguro-dev`; correrlo dos veces deja la misma cantidad de filas.
- El test de validación del JSON pasa y cubre los mínimos de marcas.
- El catálogo incluye los 10 autos y las 10 motos más patentados del último año disponible.

## Fuera de alcance

- Versiones y años por modelo. Precios o códigos de InfoAuto.

## Notas de implementación

_Se completa al cerrar el step (ver `AGENTS.md`)._
