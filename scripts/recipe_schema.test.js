import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIAS_VALIDAS, validateRecipe, validateAll } from './recipe_schema.js';

import { recetaValida } from './test-helpers.js';

/** Una receta válida a la que le falta un campo. */
function recetaSin(campo) {
  const receta = recetaValida();
  delete receta[campo];
  return receta;
}

/** Afirma que la receta se rechaza y que algún error nombra el campo. */
function rechaza(receta, campo) {
  const { ok, errors } = validateRecipe(receta);
  assert.equal(ok, false, `se esperaba rechazo por ${campo}`);
  assert.ok(
    errors.some((e) => e.includes(campo)),
    `ningún error nombra "${campo}": ${JSON.stringify(errors)}`,
  );
}

// ---------------------------------------------------------------- caso base

test('una receta completa pasa', () => {
  const { ok, errors } = validateRecipe(recetaValida());
  assert.equal(ok, true, `errores inesperados: ${JSON.stringify(errors)}`);
  assert.deepEqual(errors, []);
});

// ------------------------------------------------- nivel 1: tumban la página

test('rechaza id ausente', () => {
  rechaza(recetaSin('id'), 'id');
});

test('rechaza id que no es kebab-case', () => {
  rechaza(recetaValida({ id: 'Cafe_Touba' }), 'id');
});

test('rechaza name vacio', () => {
  rechaza(recetaValida({ name: '' }), 'name');
});

test('rechaza tags como cadena', () => {
  // ALL_TAGS hace `...r.tags`: una cadena se esparce en letras sueltas.
  rechaza(recetaValida({ tags: 'espresso' }), 'tags');
});

test('rechaza tags array vacio', () => {
  rechaza(recetaValida({ tags: [] }), 'tags');
});

test('rechaza difficulty fuera de las tres', () => {
  rechaza(recetaValida({ difficulty: 'Medio' }), 'difficulty');
});

test('rechaza categoryName vacio', () => {
  rechaza(recetaValida({ categoryName: '' }), 'categoryName');
});

test('rechaza origin ausente', () => {
  rechaza(recetaSin('origin'), 'origin');
});

test('rechaza flavorNotes array vacio', () => {
  rechaza(recetaValida({ flavorNotes: [] }), 'flavorNotes');
});

test('rechaza ingredients array vacio', () => {
  rechaza(recetaValida({ ingredients: [] }), 'ingredients');
});

test('rechaza un ingrediente sin item', () => {
  rechaza(recetaValida({ ingredients: [{ amount: '18g' }] }), 'ingredients');
});

test('rechaza un ingrediente sin amount', () => {
  rechaza(recetaValida({ ingredients: [{ item: 'Café molido' }] }), 'ingredients');
});

test('rechaza un ingrediente que no es objeto', () => {
  // App.jsx hace ing.item.toLowerCase(): un null aquí rompe la búsqueda entera.
  rechaza(recetaValida({ ingredients: [null] }), 'ingredients');
  rechaza(recetaValida({ ingredients: ['Café molido'] }), 'ingredients');
});

// ------------------------------------------- baseQty / unit: opcionales juntos

test('acepta un ingrediente sin baseQty ni unit', () => {
  const receta = recetaValida({
    ingredients: [{ item: 'Hielo en cubos', amount: 'Para servir' }],
  });
  const { ok, errors } = validateRecipe(receta);
  assert.equal(ok, true, `errores inesperados: ${JSON.stringify(errors)}`);
});

test('rechaza baseQty sin unit', () => {
  rechaza(
    recetaValida({ ingredients: [{ item: 'Café', amount: '18g', baseQty: 18 }] }),
    'ingredients',
  );
});

test('rechaza unit sin baseQty', () => {
  rechaza(
    recetaValida({ ingredients: [{ item: 'Café', amount: '18g', unit: 'g' }] }),
    'ingredients',
  );
});

test('rechaza baseQty igual a 0 o negativo', () => {
  for (const baseQty of [0, -5]) {
    rechaza(
      recetaValida({ ingredients: [{ item: 'Café', amount: '18g', baseQty, unit: 'g' }] }),
      'ingredients',
    );
  }
});

// ------------------------------------------------------------------- nivel 2

test('rechaza category que no esta en CATEGORIAS_VALIDAS', () => {
  rechaza(recetaValida({ category: 'favoritos' }), 'category');
  rechaza(recetaValida({ category: 'todos' }), 'category');
});

test('rechaza category y categoryName que no se corresponden', () => {
  rechaza(recetaValida({ category: 'frios' }), 'categoryName');
});

test('rechaza timeMinutes como cadena', () => {
  // El orden «Más Rápidos» compararía cadenas y ordenaría mal.
  rechaza(recetaValida({ timeMinutes: '5' }), 'timeMinutes');
});

test('rechaza timeMinutes NaN o Infinity', () => {
  for (const valor of [NaN, Infinity, -Infinity]) {
    rechaza(recetaValida({ timeMinutes: valor }), 'timeMinutes');
  }
});

test('rechaza steps array vacio', () => {
  rechaza(recetaValida({ steps: [] }), 'steps');
});

test('rechaza image vacio', () => {
  rechaza(recetaValida({ image: '' }), 'image');
});

// ------------------------------------------------- nivel 3: opcionales reales

test('acepta una receta sin coffeeGrams, waterMl ni milkMl', () => {
  const receta = recetaValida();
  delete receta.coffeeGrams;
  delete receta.waterMl;
  const { ok, errors } = validateRecipe(receta);
  assert.equal(ok, true, `errores inesperados: ${JSON.stringify(errors)}`);
});

test('rechaza coffeeGrams no numerico si viene', () => {
  rechaza(recetaValida({ coffeeGrams: '18' }), 'coffeeGrams');
  rechaza(recetaValida({ milkMl: 0 }), 'milkMl');
});

// -------------------------------------------------------------- robustez

test('rechaza cadenas de solo espacios en cualquier campo de texto', () => {
  for (const campo of ['name', 'origin', 'shortDesc', 'longDesc', 'ratio', 'source']) {
    rechaza(recetaValida({ [campo]: '   ' }), campo);
  }
});

test('devuelve ok false sin lanzar ante null, undefined, 42 y []', () => {
  for (const valor of [null, undefined, 42, [], 'una receta', true]) {
    const { ok, errors } = validateRecipe(valor);
    assert.equal(ok, false, `${JSON.stringify(valor)} debería rechazarse`);
    assert.ok(errors.length > 0, 'un rechazo sin errores no explica nada');
  }
});

test('acumula varios errores a la vez', () => {
  const { ok, errors } = validateRecipe(recetaValida({ name: '', tags: [], image: '' }));
  assert.equal(ok, false);
  assert.ok(errors.length >= 3, `se esperaban 3 errores o más, hubo ${errors.length}`);
});

// ----------------------------------------------------------------- validateAll

test('validateAll acepta las recetas publicadas', async () => {
  const { RECIPES_DATA } = await import('../src/data/recipesData.js');
  const { ok, errors } = validateAll(RECIPES_DATA);
  assert.equal(
    ok,
    true,
    `el esquema rechaza recetas ya publicadas, así que sobra una regla:\n${errors.join('\n')}`,
  );
});

test('validateAll prefija el indice y el id en cada error', () => {
  const { ok, errors } = validateAll([
    recetaValida(),
    recetaValida({ id: 'cafe-roto', name: '' }),
  ]);
  assert.equal(ok, false);
  assert.ok(
    errors.some((e) => e.startsWith('[1] cafe-roto:')),
    `ningún error lleva el prefijo esperado: ${JSON.stringify(errors)}`,
  );
});

test('validateAll detecta ids duplicados', () => {
  const { ok, errors } = validateAll([recetaValida(), recetaValida()]);
  assert.equal(ok, false);
  assert.ok(
    errors.some((e) => e.includes('cafe-de-prueba') && e.includes('duplicado')),
    `no se señala el id duplicado: ${JSON.stringify(errors)}`,
  );
});

test('validateAll rechaza lo que no es un array', () => {
  for (const valor of [null, undefined, {}, 'recetas']) {
    assert.equal(validateAll(valor).ok, false);
  }
});

test('CATEGORIAS_VALIDAS tiene las cinco categorias de receta', () => {
  assert.deepEqual(Object.keys(CATEGORIAS_VALIDAS).sort(), [
    'clasicos',
    'especiales',
    'filtrados',
    'frios',
    'salud',
  ]);
});
