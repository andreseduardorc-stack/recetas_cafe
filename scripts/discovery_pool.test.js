import test from 'node:test';
import assert from 'node:assert/strict';

import { DISCOVERY_POOL } from './discovery_pool.js';
import { validateAll } from './recipe_schema.js';
import { normalizarNombre } from './curator_select.js';

const { RECIPES_DATA } = await import('../src/data/recipesData.js');

/** Los valores que aparecen más de una vez en la lista. */
function repetidos(valores) {
  const vistos = new Set();
  const dobles = new Set();
  for (const valor of valores) {
    if (vistos.has(valor)) dobles.add(valor);
    vistos.add(valor);
  }
  return [...dobles];
}

test('todas las recetas del pool pasan el validador', () => {
  const { ok, errors } = validateAll(DISCOVERY_POOL);
  assert.equal(ok, true, `el pool tiene recetas inválidas:\n${errors.join('\n')}`);
});

// Las formas de que una receta quede muerta: escrita, válida, y aun así descartada
// por el bot en cada ejecución sin que nadie se entere.
//
// Que un id del pool esté publicado NO es una de ellas: el pool es un catálogo, no una
// cola, y las recetas ya publicadas siguen en él (hoy, 5 de 6). El bot las filtra en
// cada ejecución. Lo que sí mata una receta es llevar el nombre de otra ya publicada
// con un id distinto: ahí el bot la descarta creyendo que es la misma.

test('los ids del pool son unicos entre si', () => {
  const dobles = repetidos(DISCOVERY_POOL.map((r) => r.id));
  assert.deepEqual(dobles, [], `ids repetidos dentro del pool: ${dobles.join(', ')}`);
});

test('ninguna receta del pool lleva el nombre de otra publicada con distinto id', () => {
  // El bot compara nombres sin tildes ni signos: «Café Bombón» y «Cafe Bombon» son el
  // mismo para él. Si coinciden el nombre pero no el id, son dos recetas distintas y la
  // del pool no se publicará jamás.
  const porNombre = new Map(RECIPES_DATA.map((r) => [normalizarNombre(r.name), r.id]));
  const chocan = DISCOVERY_POOL.filter((r) => {
    const publicada = porNombre.get(normalizarNombre(r.name));
    return publicada !== undefined && publicada !== r.id;
  }).map((r) => `${r.id} lleva el nombre de la publicada ${porNombre.get(normalizarNombre(r.name))}`);

  assert.deepEqual(chocan, [], `recetas que el bot nunca publicaría: ${chocan.join(' | ')}`);
});

test('los nombres normalizados del pool son unicos entre si', () => {
  const dobles = repetidos(DISCOVERY_POOL.map((r) => normalizarNombre(r.name)));
  assert.deepEqual(dobles, [], `nombres repetidos dentro del pool: ${dobles.join(' | ')}`);
});

// No se exige que las imágenes sean únicas: las 27 recetas publicadas comparten 8 fotos
// de Unsplash, así que repetir es el patrón del sitio, no un defecto. Una regla de
// unicidad rechazaría contenido válido, que es el anti-objetivo del diseño.

test('normalizarNombre quita tildes, signos y mayusculas', () => {
  assert.equal(normalizarNombre('Café Bombón'), normalizarNombre('cafe bombon'));
  assert.equal(normalizarNombre('Cà Phê Trứng (Hanói)'), 'caphetrunghanoi');
  assert.equal(normalizarNombre('  Espresso  Doble  '), 'espressodoble');
});

test('una receta del pool con id ya publicado es la misma receta, no otra', () => {
  // Complementa a la comprobación de nombres: el pool es un catálogo y sus recetas
  // publicadas siguen dentro, pero si alguien escribe una receta NUEVA reutilizando
  // un id que ya existe, el bot la descarta en cada ejecución y nadie se entera.
  const porId = new Map(RECIPES_DATA.map((r) => [r.id, normalizarNombre(r.name)]));
  const impostoras = DISCOVERY_POOL.filter((r) => {
    const publicada = porId.get(r.id);
    return publicada !== undefined && publicada !== normalizarNombre(r.name);
  }).map((r) => r.id);

  assert.deepEqual(
    impostoras,
    [],
    `estos ids ya están publicados con otra receta detrás: ${impostoras.join(', ')}`,
  );
});
