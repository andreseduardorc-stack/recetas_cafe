# Ampliar el pool curado del bot

Fecha: 2026-11-21 · Alcance: cambio pequeño en código, trabajo de contenido

## Intención

El bot curador no se queda sin funcionar: se queda sin recetas. `DISCOVERY_POOL`
(`scripts/auto_curator.js`) es una lista fija de 6, de las que **queda 1** sin publicar
(`bicerin-turin`): mientras montábamos el validador, el bot publicó dos en GitHub. El
lunes que viene publica la última y al siguiente ya imprime «¡Al día!» sin añadir nada.

El rastreo automático de internet quedó descartado tras comprobar que la mitad de los
campos de una ficha (`ratio`, `grindSize`, `temp`, `flavorNotes`, `origin`, `difficulty`,
`baristaTip`) no existen en ninguna fuente legible por máquina: son criterio editorial.
Sin una clave de API de un modelo de lenguaje no hay forma de rellenarlos, y el validador
—con razón— rechazaría el 100% de lo rastreado.

Así que la enciclopedia se alimenta de recetas curadas. Este trabajo escribe las
suficientes para que el bot siga publicando medio año sin intervención.

## Objetivos

- Llevar el pool a ~30 recetas: 24 nuevas, completas y válidas según el esquema.
- Que el bot siga publicando una por semana sin que nadie lo toque hasta mediados de 2027
  (25 sin publicar: la de Turín más las 24 nuevas).
- Que cada receta nueva pase `validateRecipe` antes de entrar al archivo.

## No objetivos

- Rastrear internet. Descartado arriba, por falta de clave de API.
- Tocar la web (`src/`). Esto es contenido para el bot, no una función nueva.
- Cambiar el validador. Si una receta no pasa, se arregla la receta.

## Anti-objetivos

- **Inventar cifras.** Una ficha de barista con un ratio inventado es peor que no tener la
  receta: la página promete precisión («Ratio 1:16, agua a 94 °C») y quien la siga en su
  cocina se lleva el chasco. Ante la duda sobre una proporción concreta, se omite esa
  receta, no se rellena a ojo.
- **Rellenar para llegar a 24.** Mejor 18 recetas sólidas que 24 con seis de relleno.
- Recetas que son la misma preparación con otro nombre (un «latte de vainilla» y un
  «vanilla latte helado» ya cubiertos por `iced-vanilla-latte`).

## Restricciones

- Esquema cerrado: los 20 campos que exige `scripts/recipe_schema.js`, con `category` y
  `categoryName` emparejados según `CATEGORIAS_VALIDAS`.
- `id` en kebab-case y único frente a las 27 publicadas y frente al resto del pool.
- Textos en español, con el tono divulgativo de las fichas que ya existen.
- Imágenes: enlaces a Unsplash, como el resto del pool. (Deuda conocida: son enlaces
  calientes a un servicio ajeno. No se arregla aquí.)

## Enfoques considerados

- **A — Ampliar el pool curado.** *Elegido.* Resuelve el problema real (el bot se seca) de
  forma completa y sin riesgo. No rastrea nada.
- **B — Rastreo con cola de revisión.** El bot deja candidatas a medias en un archivo de
  pendientes para completarlas a mano. Es rastreo de verdad, pero genera trabajo semanal
  en vez de quitarlo, y no evita que el bot se quede sin publicar. Queda disponible como
  paso posterior.
- **C — Una segunda clase de receta con menos campos.** Lo rastreado publicaría solo, a
  costa de la ficha de barista, que es lo que distingue a CaféPedia de un listado de
  enlaces. Descartado.

## Lo decidido

### El pool se muda a su propio archivo

`DISCOVERY_POOL` sale de `scripts/auto_curator.js` y pasa a `scripts/discovery_pool.js`,
que lo exporta. El bot lo importa.

Hoy el script son ~310 líneas, de las que ~215 son datos de 6 recetas. Con 30 pasaría de
1.100 y la lógica del bot quedaría enterrada. Separarlo deja `auto_curator.js` en lo que
hace (elegir, insertar, recompilar) y el contenido donde se puede revisar de un vistazo.

### 24 recetas nuevas, no 47

Con 25 sin publicar a una por semana, el bot aguanta hasta mediados de 2027. Escribir de
golpe las 47 que darían un año completo multiplica el riesgo de relleno y te deja un muro
de texto que revisar. Cuando el pool baje, se amplía otra vez.

Urgencia: con una sola candidata en el pool, esto no es trabajo que pueda esperar un mes.

### Reparto por categoría

Las 27 publicadas están escoradas: 10 especiales, 5 filtrados, 5 fríos, 4 clásicos, 3 de
salud. Las 24 nuevas equilibran: ~7 clásicos, ~6 filtrados, ~5 fríos, ~4 de salud y ~2
especiales. Importa porque los filtros por categoría de la web se ven flacos en clásicos
y salud, que son justo las dos puertas de entrada más habituales.

### Cada receta se verifica antes de entrar

Una prueba nueva, `scripts/discovery_pool.test.js`, pasa `validateAll` sobre el pool
entero y comprueba además que ningún `id` del pool choque con los ya publicados en
`RECIPES_DATA`. Corre con `npm test`, o sea también en CI antes de curar.

### El criterio de rigor

Cada receta describe una preparación real y reconocible, con proporciones que son las
publicadas habitualmente para ese método. El campo `source` nombra una referencia
comprobable (una institución, un libro, una cafetería histórica), no un «tradición
popular» genérico. Si no sé el ratio de algo con suficiente confianza, esa receta no entra.

## Lo que queda al constructor

- El orden dentro del pool es el orden de publicación (el bot coge la primera válida). Se
  deja un orden que alterne categorías, para que las primeras semanas no salgan cinco
  filtrados seguidos.
- Las recetas se escriben en tandas, verificando con `npm test` al cerrar cada tanda, en
  vez de 24 de golpe y una sola comprobación al final.
