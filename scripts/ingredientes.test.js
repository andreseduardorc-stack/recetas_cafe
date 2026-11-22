import test from 'node:test';
import assert from 'node:assert/strict';

import { DISCOVERY_POOL } from './discovery_pool.js';

const { RECIPES_DATA } = await import('../src/data/recipesData.js');

/*
 * La ficha pinta la cantidad calculada y solo cae en `amount` cuando no hay `baseQty`
 * (`src/components/RecipeDetailModal.jsx`):
 *
 *     const scaledQty = ing.baseQty ? ing.baseQty * servings : null;
 *     {scaledQty ? `${scaledQty} ${ing.unit}` : ing.amount}
 *
 * Con `baseQty` presente, `amount` NO se renderiza jamás. Todo lo que diga ahí de más
 * —que un ingrediente es opcional, que va al gusto, que es para decorar— se pierde, y
 * el lector lee como obligatorio algo que no lo es.
 *
 * El dato sigue siendo válido: por eso ningún validador de forma puede atrapar esto.
 */

const MATIZ = /opcional|al gusto|para (servir|decorar)|decorar/i;

/** Ingredientes cuyo matiz vive solo en el campo que no se pinta. */
function maticesPerdidos(recetas) {
  const perdidos = [];
  for (const receta of recetas) {
    for (const [i, ing] of receta.ingredients.entries()) {
      if (ing.baseQty === undefined) continue; // sin baseQty, `amount` sí se pinta
      if (!MATIZ.test(ing.amount)) continue; // no hay matiz que perder
      if (MATIZ.test(ing.item)) continue; // el matiz está en el nombre: se ve
      perdidos.push(
        `${receta.id} · ingredients[${i}]: "${ing.amount}" se lee como ` +
          `"${ing.baseQty} ${ing.unit}" y el nombre no lo recoge ("${ing.item}")`,
      );
    }
  }
  return perdidos;
}

test('ninguna receta publicada esconde un matiz en un campo que no se pinta', () => {
  const perdidos = maticesPerdidos(RECIPES_DATA);
  assert.deepEqual(
    perdidos,
    [],
    `el lector no verá esto; muévelo al campo "item":\n  ${perdidos.join('\n  ')}`,
  );
});

test('ninguna receta del pool esconde un matiz en un campo que no se pinta', () => {
  const perdidos = maticesPerdidos(DISCOVERY_POOL);
  assert.deepEqual(
    perdidos,
    [],
    `el lector no verá esto; muévelo al campo "item":\n  ${perdidos.join('\n  ')}`,
  );
});

test('la comprobación mira los dos campos, no solo amount', () => {
  // Un «(opcional)» en el nombre está a salvo aunque `amount` lo repita: se pinta.
  const aSalvo = [
    {
      id: 'ficticia-a-salvo',
      ingredients: [
        { item: 'Jengibre rallado (opcional)', amount: 'Al gusto', baseQty: 2, unit: 'g' },
      ],
    },
  ];
  assert.deepEqual(maticesPerdidos(aSalvo), []);

  // El mismo ingrediente con el matiz solo en `amount` sí se pierde.
  const perdido = [
    {
      id: 'ficticia-perdida',
      ingredients: [
        { item: 'Jengibre rallado', amount: 'Al gusto (opcional)', baseQty: 2, unit: 'g' },
      ],
    },
  ];
  assert.equal(maticesPerdidos(perdido).length, 1);
});

test('un ingrediente sin baseQty nunca pierde nada', () => {
  // Sin cantidad calculable, la ficha pinta `amount` tal cual.
  const sinBaseQty = [
    {
      id: 'ficticia-sin-basequty',
      ingredients: [{ item: 'Hielo', amount: 'Para servir, al gusto' }],
    },
  ];
  assert.deepEqual(maticesPerdidos(sinBaseQty), []);
});
