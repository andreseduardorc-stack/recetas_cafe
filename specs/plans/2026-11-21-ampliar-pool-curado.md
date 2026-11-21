# Ampliar el pool curado — Plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development
> (recomendada) o superpowers:executing-plans para implementar este plan tarea a tarea.
> Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** Llevar el pool del bot de 1 receta sin publicar a ~25, para que siga
publicando una por semana hasta mediados de 2027 sin que nadie lo toque.

**Arquitectura:** El pool sale de `auto_curator.js` a su propio archivo y gana una prueba
que lo valida entero. Luego se escriben las recetas en cuatro tandas, cada una verificada
por esa misma prueba antes de commitear.

**Stack:** Node 20.19+ (ESM), `node:test`, sin dependencias nuevas. El validador
(`scripts/recipe_schema.js`) ya existe y no se toca.

**Spec:** `specs/2026-11-21-ampliar-pool-curado-design.md`

> **Nota de ubicación:** este plan vive en `specs/plans/`, no en `docs/superpowers/plans/`.
> En este repositorio `docs/` es la salida de `vite build` que publica GitHub Pages.

## Restricciones globales

- Sin dependencias nuevas.
- No se toca `src/`. Esto es contenido para el bot, no una función de la web.
- No se toca `scripts/recipe_schema.js`. Si una receta no pasa, se arregla la receta.
- Textos en español, tono divulgativo, como las fichas que ya existen.
- Las categorías válidas y su `categoryName` exacto salen de `CATEGORIAS_VALIDAS`
  (`scripts/recipe_schema.js:10-16`). `difficulty` es exactamente `Fácil`, `Intermedio`
  o `Avanzado`.
- **Rigor:** proporciones que son las publicadas habitualmente para ese método; `source`
  nombra una referencia comprobable. Si no se puede sostener un ratio con confianza, esa
  receta no entra: una tanda de 5 sólidas es correcta, una de 6 con una inventada no.

## Review Focus

Formas de que una receta del pool quede **muerta**: escrita, válida, y aun así nunca
publicada, sin que nadie se entere. Son el fallo característico de este trabajo, porque no
se manifiesta hasta semanas después. Cada línea tiene su prueba en la Tarea 1.

1. **Un `id` del pool que ya existe en `RECIPES_DATA`** — el filtro de duplicados del bot
   (`auto_curator.js:255-258`) la descarta en cada ejecución, para siempre.
2. **Dos recetas del pool con el mismo `id`** — la segunda nunca llega a publicarse.
3. **Un `name` cuya forma normalizada coincide con una ya publicada** — el bot compara
   nombres sin tildes ni signos; «Café Bombón» y «Cafe Bombon» son el mismo para él.
4. **Dos recetas del pool con el mismo `name` normalizado** — igual que 2, por nombre.
5. **Dos recetas con la misma URL de `image`** — no mata la receta, pero publica dos
   fichas con la misma foto, que es lo primero que se nota al mirar la rejilla.

Un sexto riesgo no es automatizable y queda al criterio humano: una receta que es **otra
preparación ya publicada con otro nombre** (el anti-objetivo del diseño). Se comprueba
leyendo los `name` y `shortDesc` publicados antes de escribir cada tanda.

---

## Estructura de archivos

- **Crear** `scripts/discovery_pool.js` — solo datos: exporta `DISCOVERY_POOL`.
- **Crear** `scripts/discovery_pool.test.js` — valida el pool entero y las cinco formas de
  receta muerta.
- **Modificar** `scripts/auto_curator.js` — importa el pool y la normalización; deja de
  contener datos.
- **Modificar** `scripts/curator_select.js` — pasa a exportar `normalizarNombre`, para que
  la prueba use la normalización real del bot y no una copia.

---

### Task 1: El pool en su propio archivo, con red de seguridad

**Archivos:**
- Crear: `scripts/discovery_pool.js`
- Crear: `scripts/discovery_pool.test.js`
- Modificar: `scripts/auto_curator.js` (quitar `DISCOVERY_POOL` y `normalize`, importarlos)
- Modificar: `scripts/curator_select.js` (exportar `normalizarNombre`)

**Interfaces:**
- Consume: `validateAll` de `./recipe_schema.js`.
- Produce:
  - `DISCOVERY_POOL: object[]` desde `./discovery_pool.js`.
  - `normalizarNombre(texto: string) => string` desde `./curator_select.js` — minúsculas,
    sin diacríticos, sin lo que no sea `[a-z0-9]`. Es la función que hoy vive como
    `normalize` en `auto_curator.js:228-230`, movida tal cual.

- [ ] **Paso 1: Escribir las pruebas que fallan**

En `scripts/discovery_pool.test.js`, con `node:test` y `node:assert/strict`. Importa
`DISCOVERY_POOL`, `RECIPES_DATA` (con `await import('../src/data/recipesData.js')`),
`validateAll` y `normalizarNombre`.

```
'todas las recetas del pool pasan el validador'
    -> validateAll(DISCOVERY_POOL).ok === true; el mensaje de fallo imprime errors.join('\n')

'ningun id del pool choca con una receta publicada'          // Review Focus 1
    -> interseccion de ids vacia; el mensaje nombra los ids que chocan

'los ids del pool son unicos entre si'                       // Review Focus 2

'ningun nombre normalizado del pool choca con uno publicado' // Review Focus 3
    -> usando normalizarNombre, no una copia

'los nombres normalizados del pool son unicos entre si'      // Review Focus 4

'ninguna imagen se repite dentro del pool'                   // Review Focus 5

'normalizarNombre quita tildes, signos y mayusculas'
    -> normalizarNombre('Café Bombón') === normalizarNombre('cafe bombon')
```

- [ ] **Paso 2: Ejecutar las pruebas y ver que fallan**

Ejecuta: `npm test`

Esperado: FALLA con `Cannot find module` de `discovery_pool.js`.

- [ ] **Paso 3: Mover el pool y la normalización**

Corta el array `DISCOVERY_POOL` de `auto_curator.js` (líneas ~14-226) a
`scripts/discovery_pool.js` con `export const DISCOVERY_POOL = [...]`, **sin cambiar ni
una receta**. Mueve `normalize` a `curator_select.js` como `normalizarNombre` exportada.
En `auto_curator.js`, importa ambas y borra las definiciones locales.

- [ ] **Paso 4: Ejecutar las pruebas y ver que pasan**

Ejecuta: `npm test`

Esperado: PASS. Las 6 recetas que ya están en el pool tienen que pasar sin tocarlas; si
alguna falla, el fallo es de la prueba, no de la receta.

- [ ] **Paso 5: Confirmar que las pruebas detectan algo de verdad**

Añade temporalmente al pool una copia de una receta publicada (mismo `id` y `name`),
ejecuta `npm test`, comprueba que fallan las pruebas de choque de id **y** de nombre, y
deshaz el cambio.

- [ ] **Paso 6: Comprobar que el bot sigue funcionando**

Ejecuta: `npm run curate`

Esperado: publica `bicerin-turin`, la última candidata. Después:
`git checkout -- src/data/recipesData.js docs/` para dejarlo sin publicar.

- [ ] **Paso 7: Commit**

```bash
git add scripts/discovery_pool.js scripts/discovery_pool.test.js scripts/auto_curator.js scripts/curator_select.js
git commit -m "refactor(curator): el pool de descubrimiento vive en su propio archivo"
```

---

## Las cuatro tandas (Tasks 2 a 5)

Cuatro tareas con la misma forma; cambia el reparto por categoría. El total suma 24:
7 clásicos, 6 filtrados, 5 fríos, 4 de salud, 2 especiales. Los especiales van cortos a
propósito: ya son 10 de las 27 publicadas.

**Los cuatro pasos, idénticos en las cuatro tareas** (cada tarea dice solo su reparto):

1. **Leer lo que ya hay, para no repetirlo.** Ejecuta
   `node -e "import('./src/data/recipesData.js').then(m=>m.RECIPES_DATA.forEach(r=>console.log(r.category,'|',r.name)))"`
   y repasa también los `name` del pool. Es la comprobación del riesgo que ninguna prueba
   cubre: una preparación ya publicada con otro nombre.
2. **Escribir las recetas** al final de `DISCOVERY_POOL`, con los 20 campos obligatorios y
   el reparto de su tabla. Preparación real y reconocible, proporciones sostenibles,
   `source` con referencia comprobable. **Si una no se sostiene, se cae y la tanda entrega
   5.** Orden dentro de la tanda: alternando categoría, nunca dos de la misma seguidas —
   el bot publica en ese orden y no deben salir tres filtrados en tres semanas.
3. **Verificar:** `npm test`. Esperado PASS. Si falla el validador, el mensaje nombra campo
   y receta; se arregla la receta. Si falla un choque de id o de nombre, se renombra.
4. **Commit:** `git add scripts/discovery_pool.js` y
   `git commit -m "content(pool): tanda <N> — <categorias cubiertas>"`.

---

### Task 2: Primera tanda

**Archivos:** Modificar `scripts/discovery_pool.js`
**Interfaces:** consume el esquema validado en la Tarea 1; no produce nada nuevo.

Reparto: **2 clásicos, 2 filtrados, 1 frío, 1 de salud.**

- [ ] Paso 1: leer lo publicado (ver «los cuatro pasos»)
- [ ] Paso 2: escribir las 6 recetas
- [ ] Paso 3: `npm test` → PASS
- [ ] Paso 4: commit

---

### Task 3: Segunda tanda

**Archivos:** Modificar `scripts/discovery_pool.js`
**Interfaces:** consume el esquema validado en la Tarea 1; no produce nada nuevo.

Reparto: **2 clásicos, 1 filtrado, 2 fríos, 1 de salud.**

- [ ] Paso 1: leer lo publicado (ver «los cuatro pasos»)
- [ ] Paso 2: escribir las 6 recetas
- [ ] Paso 3: `npm test` → PASS
- [ ] Paso 4: commit

---

### Task 4: Tercera tanda

**Archivos:** Modificar `scripts/discovery_pool.js`
**Interfaces:** consume el esquema validado en la Tarea 1; no produce nada nuevo.

Reparto: **2 clásicos, 2 filtrados, 1 frío, 1 especial.**

- [ ] Paso 1: leer lo publicado (ver «los cuatro pasos»)
- [ ] Paso 2: escribir las 6 recetas
- [ ] Paso 3: `npm test` → PASS
- [ ] Paso 4: commit

---

### Task 5: Cuarta tanda

**Archivos:** Modificar `scripts/discovery_pool.js`
**Interfaces:** consume el esquema validado en la Tarea 1; no produce nada nuevo.

Reparto: **1 clásico, 1 filtrado, 1 frío, 2 de salud, 1 especial.**

- [ ] Paso 1: leer lo publicado (ver «los cuatro pasos»)
- [ ] Paso 2: escribir las 6 recetas
- [ ] Paso 3: `npm test` → PASS
- [ ] Paso 4: commit

---

## Cierre

- [ ] **Comprobar la cobertura final**

```bash
node -e "
Promise.all([import('./src/data/recipesData.js'),import('./scripts/discovery_pool.js')]).then(([d,p])=>{
  const pub=new Set(d.RECIPES_DATA.map(r=>r.id));
  const quedan=p.DISCOVERY_POOL.filter(r=>!pub.has(r.id));
  console.log('sin publicar:',quedan.length,'-> semanas de autonomia:',quedan.length);
  const c={}; for(const r of [...d.RECIPES_DATA,...quedan]) c[r.category]=(c[r.category]||0)+1;
  console.log('reparto final:',c);
});"
```

Esperado: 25 sin publicar (o 21+ si alguna tanda entregó 5 por el criterio de rigor), y un
reparto por categoría menos escorado que el 10/5/5/4/3 de partida.

## Qué queda fuera, anotado

- Las imágenes siguen siendo enlaces calientes a Unsplash. Deuda conocida del proyecto.
- El cableado de `auto_curator.js` sigue sin pruebas automáticas (hallazgo Important de la
  revisión anterior). Este plan no lo arregla.
- El fallo de `src/components/SubmitRecipeModal.jsx:90` (`salud` cae en el `else` y se
  etiqueta como «Especiales & De Autor») sigue abierto: está en `src/`, fuera de alcance.
