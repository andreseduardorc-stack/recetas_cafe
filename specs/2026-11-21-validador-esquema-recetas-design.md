# Validador de esquema para el bot curador

Fecha: 2026-11-21 · Alcance: cambio pequeño

## Intención

Hoy el bot curador escribe en `src/data/recipesData.js` cualquier objeto que le pongan
en `DISCOVERY_POOL` sin comprobar nada. Mientras las recetas se escriban a mano no pasa
nada; en cuanto vengan de un rastreo automático, una receta mal formada llega a `docs/`
y rompe la web en el navegador. `npm run build` no lo detecta, porque la compilación no
ejecuta el módulo de datos.

El validador es el guard que falta entre "elegir candidata" y "escribir el archivo".

## Objetivos

- Que ninguna receta mal formada se escriba en `recipesData.js`.
- Que el bot siga publicando aunque una candidata venga mal: la descarta y prueba la
  siguiente.
- Que el rechazo quede explicado en el log de Actions, con el campo y el motivo.

## No objetivos

- Rastrear internet. Eso es el paso siguiente, no este.
- Validar la *calidad* del contenido: si el ratio es sensato, si la receta está rica, si
  la fuente es fiable. Solo se valida la **forma**.
- Tocar `src/`. El validador vive entero en `scripts/`.

## Anti-objetivos

- **Rechazar recetas buenas.** Un falso positivo es peor que dejar pasar una floja: mata
  el bot en silencio y nadie lo mira hasta dentro de un mes. De ahí la comprobación de
  arranque contra las 25 recetas existentes.
- Un validador tan estricto que haya que relajarlo cada vez que entra una receta rara
  (el Kaffeost no tiene leche, el Yuenyeung lleva té). El esquema se deduce de lo que ya
  hay, no de lo que yo creo que debería ser una receta.

## Restricciones

- Sin dependencias nuevas: `scripts/` tiene que seguir arrancando con `node` pelado.
- Node 20.19+ (es lo que fija `node-version: 20` en el workflow y lo que piden Vite 8 y
  `@vitejs/plugin-react`).
- El proyecto no tiene runner de pruebas. Se usa `node --test`, que viene en el propio
  Node, en vez de añadir uno.

## Enfoques considerados

- **A — Validador a mano, módulo propio sin dependencias.** *Elegido.* El esquema de una
  receta es cerrado y estable; no se va a iterar sobre él lo bastante como para que una
  librería se pague. Cero dependencias nuevas.
- **B — `zod`.** Esquema declarativo y mensajes de error hechos. Descartado: mete una
  dependencia en un proyecto de cinco para usarla en un único archivo de build. Si el
  rastreo real lo pide, cambiar A por B es una tarde.
- **C — Validar en el navegador al cargar `RECIPES_DATA`.** Descartado como solución
  única: evitaría el crash, pero la receta mala ya estaría commiteada y publicada, y no
  permite "descartar y probar la siguiente", que es el comportamiento acordado.

## Lo decidido

### El módulo

`scripts/recipe_schema.js` exporta:

- `validateRecipe(receta)` → `{ ok: boolean, errors: string[] }`. Función pura, sin
  efectos, sin salida por consola. Devuelve **todos** los errores, no solo el primero.
- `validateAll(recetas)` → mismo contrato, agregando por índice e `id`.

### Las reglas

Tres niveles, deducidos del código que consume cada campo:

**Nivel 1 — su ausencia tumba la página entera.** `ALL_TAGS` (`recipesData.js:1033-1043`)
se construye al importar el módulo: si uno de estos falta, el `import` lanza y la web sale
en blanco.

| Campo | Regla |
|---|---|
| `id` | cadena no vacía, kebab-case, única en el archivo |
| `name` | cadena no vacía |
| `tags` | array no vacío de cadenas no vacías |
| `difficulty` | una de `Fácil` / `Intermedio` / `Avanzado` |
| `categoryName` | cadena no vacía |
| `origin` | cadena no vacía |
| `flavorNotes` | array no vacío de cadenas no vacías |
| `ingredients` | array no vacío; cada elemento con `item` y `amount` cadenas no vacías (`App.jsx:62` hace `ing.item.toLowerCase()`) |

`baseQty` y `unit` de un ingrediente son opcionales, pero **van juntos**: si hay `baseQty`
tiene que ser número > 0 y haber `unit` cadena no vacía. Sin ellos la ficha cae en
`ing.amount`, que por eso es obligatorio.

**Nivel 2 — la ficha se ve rota o un filtro deja de funcionar.** También rechazan; es
contenido automático y no queremos publicar fichas a medias.

`category` (uno de `clasicos`, `filtrados`, `frios`, `especiales`, `salud`),
`timeMinutes` (número > 0, lo usa el orden "Más Rápidos"), `time`, `shortDesc`,
`longDesc`, `ratio`, `grindSize`, `temp`, `baristaTip`, `source`, `image` (cadenas no
vacías) y `steps` (array no vacío de cadenas no vacías).

**Nivel 3 — opcionales de verdad.** `coffeeGrams`, `waterMl`, `milkMl`: hoy no los lee
ningún componente. Si vienen, número > 0; si no vienen, da igual.

### El comportamiento del bot

1. **Al arrancar**, antes de nada: importar `RECIPES_DATA` y pasarle `validateAll`. Si
   alguna de las 25 recetas existentes falla, el esquema está mal deducido — se aborta
   con código 1 **sin escribir nada**. Es la comprobación de que el validador mide lo que
   dice medir y no mi idea de lo que debería ser una receta.
2. Recorrer las candidatas en orden en vez de coger `candidates[0]`. La primera que pase
   `validateRecipe` se inserta.
3. Cada descarte se imprime: `⚠️ Descartada "<nombre>": <errores>`.
4. Si no había ninguna candidata (todas ya están en la enciclopedia): mensaje y salida 0,
   como ahora.
5. Si había candidatas y **todas** fallaron: salida 1. Eso sí es un problema que merece
   verse en rojo en Actions.

### Pruebas

`scripts/recipe_schema.test.js` con `node:test`, que viene en Node — sin runner nuevo.
Cubre: una receta válida pasa; cada regla de nivel 1 rechaza cuando se rompe a propósito;
`baseQty` sin `unit` rechaza; los opcionales de nivel 3 ausentes no rechazan.

`package.json` gana `"test": "node --test scripts/"`, y el workflow lo ejecuta antes de
`npm run curate`.

### Dónde va este documento

En `specs/` en la raíz, **no** en `docs/`: esa carpeta es la salida de `vite build` que
publica GitHub Pages, y el diseño acabaría colgado en la web.

## Lo que queda al constructor

- (Resuelto al escribir el plan: la pareja `category` / `categoryName` es consistente en
  las 25 recetas y coincide con los `label` de `CATEGORIES`, así que se valida la pareja
  completa contra `CATEGORIES`.)
- **Fuera de alcance, anotado:** al importar `RECIPES_DATA` para validar, la
  deduplicación por expresión regular de `auto_curator.js:230-232` podría hacerse sobre
  el array de verdad. Mejor, pero es otro cambio; no se toca aquí.
