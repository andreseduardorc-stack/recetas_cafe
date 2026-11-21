# Validador de esquema del bot curador — Plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development
> (recomendada) o superpowers:executing-plans para implementar este plan tarea a tarea.
> Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** Que el bot curador no pueda escribir en `recipesData.js` una receta mal
formada: la descarta, explica por qué y prueba la siguiente candidata.

**Arquitectura:** Un módulo puro sin dependencias (`scripts/recipe_schema.js`) que
devuelve `{ ok, errors[] }`, consumido por `auto_curator.js` en dos puntos: una
comprobación de arranque sobre las recetas ya publicadas y un filtro sobre las
candidatas. Pruebas con `node:test`, que viene en Node.

**Stack:** Node 20.19+ (ESM, `"type": "module"`), `node:test`, sin dependencias nuevas.

**Spec:** `specs/2026-11-21-validador-esquema-recetas-design.md`

> **Nota de ubicación:** este plan vive en `specs/plans/`, no en `docs/superpowers/plans/`.
> En este repositorio `docs/` es la salida de `vite build` que publica GitHub Pages.

## Restricciones globales

- Sin dependencias nuevas. `scripts/` arranca con `node` pelado.
- Node 20.19+ (`node-version: 20` en el workflow; Vite 8 y `@vitejs/plugin-react` lo exigen).
- No se toca `src/`. El validador vive entero en `scripts/`.
- Mensajes de error y de consola **en español**.
- Los valores de `difficulty` son exactamente `Fácil`, `Intermedio`, `Avanzado` (con tilde).
- Las categorías válidas son `clasicos`, `filtrados`, `frios`, `especiales`, `salud`
  (ni `todos` ni `favoritos`, que son vistas, no categorías de receta).

## Review Focus

Cinco entradas que el diseño implica pero que es fácil no probar, y que son las que más
daño harían. Cada una tiene su prueba asignada a la tarea que posee el código.

1. **`tags` como cadena en vez de array** — `ALL_TAGS` hace `...r.tags`; esparcir una
   cadena produce sus letras sueltas. No revienta: corrompe el autocompletado en silencio.
   Es el fallo más probable de un extractor automático. → Tarea 1.
2. **Cadenas de solo espacios** (`"   "`) — pasan un `typeof === 'string'` ingenuo y dejan
   la ficha con huecos. → Tarea 1.
3. **`null` / `undefined` / un array como receta entera** — el validador no debe lanzar;
   debe devolver `ok: false`. Si lanza, tumba el bot en vez de descartar la receta. → Tarea 1.
4. **Un elemento de `ingredients` que no es objeto** (`null`, una cadena) — `App.jsx:62`
   hace `ing.item.toLowerCase()` y rompe la búsqueda de toda la web. → Tarea 1.
5. **`timeMinutes` como cadena `"5"`** — el orden «Más Rápidos» compara cadenas y ordena
   mal sin avisar. También `NaN` e `Infinity`. → Tarea 1.

---

## Estructura de archivos

- **Crear** `scripts/recipe_schema.js` — las reglas y las dos funciones públicas. Única
  responsabilidad: decir si un objeto tiene forma de receta. No lee archivos, no imprime.
- **Crear** `scripts/recipe_schema.test.js` — pruebas del módulo anterior.
- **Modificar** `scripts/auto_curator.js` — engancha el validador. No contiene reglas.
- **Modificar** `package.json` — script `test`.
- **Modificar** `.github/workflows/auto_curator.yml` — ejecuta las pruebas antes de curar.

---

### Task 1: El módulo validador

**Archivos:**
- Crear: `scripts/recipe_schema.js`
- Crear: `scripts/recipe_schema.test.js`
- Modificar: `package.json` (campo `scripts`)

**Interfaces:**
- Consume: nada.
- Produce:
  - `CATEGORIAS_VALIDAS: Record<string, string>` — mapa `category` → `categoryName`
    esperado, con las cinco parejas de las Restricciones globales.
  - `validateRecipe(receta: unknown) => { ok: boolean, errors: string[] }` — pura, nunca
    lanza, devuelve **todos** los errores encontrados, no solo el primero.
  - `validateAll(recetas: unknown) => { ok: boolean, errors: string[] }` — valida cada
    elemento prefijando `[i] <id|sin id>: ` a cada error, y añade un error por cada `id`
    repetido en el conjunto.

- [ ] **Paso 1: Escribir las pruebas que fallan**

En `scripts/recipe_schema.test.js`, con `node:test` y `node:assert/strict`. Un helper
`recetaValida()` que devuelve un objeto nuevo y completo en cada llamada (para poder
romper un campo sin contaminar las demás pruebas); constrúyelo copiando los campos de
cualquier receta de `src/data/recipesData.js`.

Nombres y aserciones de las pruebas:

```
// Caso base
'una receta completa pasa'                    -> ok === true, errors.length === 0

// Nivel 1 — cada campo, roto a propósito (todas: ok === false)
'rechaza id ausente'
'rechaza id que no es kebab-case'             -> p. ej. 'Cafe_Touba'
'rechaza name vacio'
'rechaza tags como cadena'                    // Review Focus 1
'rechaza tags array vacio'
'rechaza difficulty fuera de las tres'        -> p. ej. 'Medio'
'rechaza categoryName vacio'
'rechaza origin ausente'
'rechaza flavorNotes array vacio'
'rechaza ingredients array vacio'
'rechaza un ingrediente sin item'
'rechaza un ingrediente sin amount'
'rechaza un ingrediente que no es objeto'     // Review Focus 4

// baseQty / unit: opcionales, pero van juntos
'acepta un ingrediente sin baseQty ni unit'   -> ok === true
'rechaza baseQty sin unit'
'rechaza unit sin baseQty'
'rechaza baseQty igual a 0 o negativo'

// Nivel 2
'rechaza category que no esta en CATEGORIAS_VALIDAS'
'rechaza category y categoryName que no se corresponden'
'rechaza timeMinutes como cadena'             // Review Focus 5
'rechaza timeMinutes NaN o Infinity'          // Review Focus 5
'rechaza steps array vacio'
'rechaza image vacio'

// Nivel 3 — opcionales de verdad
'acepta una receta sin coffeeGrams, waterMl ni milkMl'  -> ok === true
'rechaza coffeeGrams no numerico si viene'

// Robustez — Review Focus 2 y 3
'rechaza cadenas de solo espacios en cualquier campo de texto'
'devuelve ok false sin lanzar ante null, undefined, 42 y []'
'acumula varios errores a la vez'             -> errors.length >= 2

// validateAll
'validateAll acepta las recetas publicadas'
'validateAll prefija el indice y el id en cada error'
'validateAll detecta ids duplicados'
```

La prueba `validateAll acepta las recetas publicadas` hace
`const { RECIPES_DATA } = await import('../src/data/recipesData.js')` y exige
`ok === true`. Es la comprobación de que el esquema mide lo que dice medir: si falla, la
regla sobra, no la receta.

- [ ] **Paso 2: Ejecutar las pruebas y ver que fallan**

Añade antes a `package.json`: `"test": "node --test scripts/"`.

Ejecuta: `npm test`

Esperado: FALLA con `Cannot find module` de `recipe_schema.js`.

- [ ] **Paso 3: Implementar `scripts/recipe_schema.js`**

Exporta las tres interfaces del bloque de arriba. Reglas, agrupadas por nivel:

*Nivel 1 (su ausencia tumba la página al importar `recipesData.js`):* `id` (cadena no
vacía, `/^[a-z0-9]+(-[a-z0-9]+)*$/`), `name`, `categoryName`, `origin` (cadenas no
vacías), `difficulty` (una de las tres), `tags` y `flavorNotes` (arrays no vacíos de
cadenas no vacías), `ingredients` (array no vacío; cada elemento objeto con `item` y
`amount` cadenas no vacías; `baseQty` y `unit` ausentes ambos, o `baseQty` número finito
mayor que 0 **y** `unit` cadena no vacía).

*Nivel 2:* `category` en `CATEGORIAS_VALIDAS` **y** `categoryName` igual al valor que le
corresponde; `timeMinutes` número finito mayor que 0; `steps` array no vacío de cadenas
no vacías; `time`, `shortDesc`, `longDesc`, `ratio`, `grindSize`, `temp`, `baristaTip`,
`source`, `image` cadenas no vacías.

*Nivel 3:* `coffeeGrams`, `waterMl`, `milkMl` — si la clave está presente, número finito
mayor que 0; si no, se ignora.

Una cadena «no vacía» es `typeof v === 'string' && v.trim() !== ''`. Un número válido es
`typeof v === 'number' && Number.isFinite(v) && v > 0` — eso descarta de un golpe las
cadenas numéricas, `NaN` e `Infinity`. Si la receta no es un objeto plano (`null`, array,
primitivo), devuelve `ok: false` con un único error y no sigue comprobando campos.

Cada mensaje de error nombra el campo y lo que se esperaba, en español. Ejemplo:
`tags: se esperaba un array no vacío de cadenas`.

- [ ] **Paso 4: Ejecutar las pruebas y ver que pasan**

Ejecuta: `npm test`

Esperado: todas en PASS, incluida `validateAll acepta las recetas publicadas`.

Si esa última falla, **la regla está mal, no la receta**: corrige `recipe_schema.js`
hasta que las 25 recetas publicadas pasen. Es el anti-objetivo del diseño.

- [ ] **Paso 5: Confirmar que las pruebas detectan algo de verdad**

Rompe a propósito una regla de `recipe_schema.js` (por ejemplo, deja de comprobar
`tags`), ejecuta `npm test`, comprueba que falla, y deshaz el cambio.

- [ ] **Paso 6: Commit**

```bash
git add scripts/recipe_schema.js scripts/recipe_schema.test.js package.json
git commit -m "feat(curator): validador de esquema de recetas sin dependencias"
```

---

### Task 2: Enganchar el validador en el bot

**Archivos:**
- Modificar: `scripts/auto_curator.js`

**Interfaces:**
- Consume: `validateRecipe` y `validateAll` de `./recipe_schema.js` (Tarea 1).
- Produce: nada para tareas posteriores.

- [ ] **Paso 1: Comprobación de arranque**

En `runAutoCurator()`, antes de leer el archivo con `fs.readFileSync`: importa
`RECIPES_DATA` con `await import()` desde `src/data/recipesData.js` y pásale
`validateAll`. Si `ok === false`, imprime cada error y `process.exit(1)` **sin escribir
nada**. El mensaje deja claro que el fallo es del esquema, no de la receta nueva.

- [ ] **Paso 2: Recorrer las candidatas en vez de coger la primera**

Sustituye `const toAdd = candidates[0];` (`auto_curator.js:244`) por un recorrido de
`candidates` en orden. Por cada una, `validateRecipe`; si falla, imprime
`⚠️ Descartada "<name>": <errores separados por "; ">` y sigue. La primera que pasa es la
que se inserta.

- [ ] **Paso 3: Códigos de salida**

- Sin candidatas (todas ya publicadas): el mensaje actual «¡Al día!» y `return` — salida 0.
- Con candidatas y **todas** rechazadas: imprime cuántas se descartaron y `process.exit(1)`.
- Una válida: sigue el camino actual (insertar, `npm run build`).

- [ ] **Paso 4: Verificar los tres caminos a mano**

Camino feliz:

```bash
npm run curate
node -e "import('./src/data/recipesData.js').then(m=>console.log(m.RECIPES_DATA.length))"
```

Esperado: `✅ ¡Receta "Yuenyeung..." agregada con éxito!` y que el conteo dé 26.

Deshaz antes de la siguiente comprobación:

```bash
git checkout src/data/recipesData.js docs/
```

Después, rompe temporalmente una entrada del `DISCOVERY_POOL` (por ejemplo
`tags: 'yuenyeung'` como cadena), vuelve a ejecutar `npm run curate` y confirma que la
descarta nombrándola y pasa a la siguiente. Deshaz el cambio al terminar.

- [ ] **Paso 5: Ejecutar la suite completa**

Ejecuta: `npm test && npm run lint`

Esperado: PASS y sin avisos nuevos de oxlint.

- [ ] **Paso 6: Commit**

```bash
git add scripts/auto_curator.js
git commit -m "feat(curator): descarta recetas invalidas y prueba la siguiente candidata"
```

---

### Task 3: Las pruebas corren en CI

**Archivos:**
- Modificar: `.github/workflows/auto_curator.yml`

**Interfaces:**
- Consume: el script `npm test` (Tarea 1).

- [ ] **Paso 1: Añadir el paso de pruebas**

Entre «Instalar dependencias» y «Ejecutar Bot Curador de Recetas», un paso
`- name: Ejecutar pruebas del validador` con `run: npm test`. Si falla, el workflow para
antes de tocar `recipesData.js`.

- [ ] **Paso 2: Verificar la sintaxis del workflow**

Revisa a ojo la indentación del paso nuevo (dos espacios por nivel, alineado con los
`- name:` vecinos). No hay validador de YAML en el proyecto.

- [ ] **Paso 3: Commit**

```bash
git add .github/workflows/auto_curator.yml
git commit -m "ci: ejecuta las pruebas del validador antes de curar"
```

---

## Qué queda fuera, anotado

- La deduplicación por expresión regular de `auto_curator.js:230-232` podría hacerse sobre
  el `RECIPES_DATA` ya importado. Mejor, pero es otro cambio.
- El `DISCOVERY_POOL` sigue siendo una lista fija de 6 recetas, de las que quedan 3. El
  validador no arregla eso; es el paso siguiente del proyecto.
