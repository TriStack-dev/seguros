---
name: git-branch-naming
description: Convención de nombres de ramas, commits y PRs de este repo (MiSeguro). Las ramas son `<tipo>/<descripción>` con tipo feat, fix, refactor, chore, docs o test, y la descripción tiene que nombrar el cambio concreto. Usala siempre que vayas a crear una rama, empezar a trabajar un step del spec, commitear o abrir un PR — también cuando el usuario solo dice "armá una rama", "empecemos el step 04", "commiteá esto", "subí esto" o "hacé un PR", sin mencionar ninguna convención. Consultala ANTES de crear la rama: el hook pre-push rechaza los nombres que no cumplen y rehacer una rama ya empezada es trabajo perdido.
---

# Nombres de ramas, commits y PRs

## Por qué existe esto

El repo lo trabajan varias personas y varios agentes (Claude Code, Codex). El nombre de la
rama es lo primero y a veces lo único que alguien ve de tu trabajo: en la lista de PRs, en
`git branch`, en los previews de Vercel. Un nombre como `fix/bug` obliga a abrir el PR para
entender de qué se trata; `fix/quote-premium-rounding` no.

El tipo al principio sirve para otra cosa: hace que la lista de ramas se agrupe sola por
intención, y mantiene alineados el nombre de la rama y el prefijo de los commits, que ya
usan Conventional Commits (ver `AGENTS.md`).

## La forma

```
<tipo>/<descripción>
<tipo>/<NN>-<descripción>     cuando el trabajo es un step del spec (NN = número del step)
```

- **tipo**: uno de `feat`, `fix`, `refactor`, `chore`, `docs`, `test`. Son los mismos de
  Conventional Commits que ya usa el repo, a propósito.
- **descripción**: en inglés (como pide `AGENTS.md` para ramas), minúsculas, palabras
  separadas por guiones, **dos palabras o más**. El mínimo de dos palabras no es
  burocracia: una sola palabra casi nunca alcanza para distinguir tu rama de otra.
- Nada de `_`, mayúsculas, acentos, puntos ni espacios. Hasta ~50 caracteres después de la
  barra, para que el nombre entre completo en la UI de GitHub.

## Qué tipo corresponde

Elegí por la **intención del cambio**, no por los archivos que tocás:

| Tipo | Cuándo |
| --- | --- |
| `feat` | funcionalidad nueva que el usuario puede ver o usar |
| `fix` | algo andaba mal y lo arreglás |
| `refactor` | el comportamiento no cambia, el código sí |
| `chore` | tooling, dependencias, config, CI, hooks |
| `docs` | solo documentación (`SPEC.md`, `docs/`, `README.md`) |
| `test` | solo tests, sin tocar el código que prueban |

Si dudás entre dos, preguntate qué pondrías en el prefijo del commit principal y usá ese.
Si de verdad el trabajo son dos cosas distintas, probablemente sean dos ramas y dos PRs.

## Qué significa "detallado"

La descripción tiene que nombrar **el cambio concreto**, no la categoría del trabajo. La
prueba rápida: si alguien lee solo el nombre, ¿sabe qué va a encontrar en el diff?

**Bien:**

```
feat/04-vehicle-catalog-seed
feat/quote-form-step-validation
fix/premium-rounding-on-annual-plans
refactor/extract-quote-rules-to-lib
chore/enforce-branch-naming-convention
docs/document-provisional-values
test/add-coverage-days-unit-tests
```

**Mal, y por qué:**

```
feat/new-feature          la categoría otra vez, no dice nada
fix/bug                   ídem
chore/updates             ¿de qué?
feat/quotes               una sola palabra: ¿el form? ¿el cálculo? ¿el listado?
wip/testing               `wip` no es un tipo, y "testing" no es un cambio
feat/WalterBranch         el nombre no es tuyo, es del cambio
feat/step-04              el número solo; va el número Y qué hace: feat/04-data-model
fix/arreglar-redondeo     las ramas van en inglés
```

## Steps del spec

Cuando el trabajo es un step de `SPEC.md`, poné el número de dos dígitos adelante de la
descripción, con el tipo que corresponda al step:

```
feat/04-data-model
feat/15-admin-auth
chore/03-github-actions-ci
```

El número hace que la rama se pueda cruzar con la tabla de la sección 9 de `SPEC.md` de un
vistazo. El tipo igual importa: no todos los steps agregan funcionalidad.

El título del PR no sigue esta convención: para steps es `Step NN — Título del step`, como
dice `AGENTS.md`.

## Commits

Mismos tipos, formato Conventional Commits:

```
<tipo>: <qué hace, en imperativo y en inglés>
```

El cuerpo es donde explicás **por qué**, qué alternativas descartaste y qué quedó afuera.
Eso es lo que le sirve a quien lea el `git log` en seis meses; el "qué" ya está en el diff.

```
feat: validate quote form per step before advancing

The single-submit validation let people reach the last step with an
invalid DNI and only find out at the end. Validating per step surfaces
the error where it was introduced.
```

## Si el hook te rechaza el push

`.githooks/pre-push` valida el nombre de cada rama que pushees y rechaza las que no cumplen.
No es un castigo: es para que no llegue a GitHub un nombre que después hay que renombrar con
el PR abierto. Para arreglarlo, renombrá la rama y volvé a pushear:

```bash
git branch -m feat/quote-form-step-validation
git push -u origin feat/quote-form-step-validation
```

Si ya la habías pusheado con el nombre viejo, borrá la remota: `git push origin --delete <nombre-viejo>`.

El hook valida la forma (tipo válido, minúsculas con guiones, dos palabras o más). Lo que no
puede juzgar es si la descripción es **informativa**: `feat/some-new-thing` pasa el regex y
es un mal nombre igual. Eso es tu trabajo y el de quien revise el PR.
