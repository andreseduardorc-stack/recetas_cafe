import test from 'node:test';
import assert from 'node:assert/strict';

import { elegirCandidata } from './curator_select.js';
import { recetaValida } from './test-helpers.js';

test('elige la primera candidata valida', () => {
  const primera = recetaValida({ id: 'primera', name: 'Primera' });
  const segunda = recetaValida({ id: 'segunda', name: 'Segunda' });

  const { elegida, descartes } = elegirCandidata([primera, segunda]);

  assert.equal(elegida.id, 'primera');
  assert.deepEqual(descartes, []);
});

test('descarta una candidata invalida y elige la siguiente', () => {
  const rota = recetaValida({ id: 'rota', name: 'Rota', tags: 'una-cadena' });
  const buena = recetaValida({ id: 'buena', name: 'Buena' });

  const { elegida, descartes } = elegirCandidata([rota, buena]);

  assert.equal(elegida.id, 'buena');
  assert.equal(descartes.length, 1);
  assert.equal(descartes[0].nombre, 'Rota');
  assert.ok(
    descartes[0].errores.some((e) => e.includes('tags')),
    `el descarte no explica el motivo: ${JSON.stringify(descartes[0].errores)}`,
  );
});

test('no elige ninguna si todas son invalidas y devuelve todos los descartes', () => {
  const rotas = [
    recetaValida({ id: 'rota-1', name: 'Rota 1', steps: [] }),
    recetaValida({ id: 'rota-2', name: 'Rota 2', difficulty: 'Medio' }),
  ];

  const { elegida, descartes } = elegirCandidata(rotas);

  assert.equal(elegida, null);
  assert.equal(descartes.length, 2);
  assert.deepEqual(
    descartes.map((d) => d.nombre),
    ['Rota 1', 'Rota 2'],
  );
});

test('no sigue evaluando despues de encontrar una valida', () => {
  const buena = recetaValida({ id: 'buena', name: 'Buena' });
  const rotaDetras = recetaValida({ id: 'rota', name: 'Rota', image: '' });

  const { elegida, descartes } = elegirCandidata([buena, rotaDetras]);

  assert.equal(elegida.id, 'buena');
  assert.deepEqual(descartes, [], 'no debe descartar lo que no llegó a mirar');
});

test('con una lista vacia no elige nada ni descarta nada', () => {
  const { elegida, descartes } = elegirCandidata([]);

  assert.equal(elegida, null);
  assert.deepEqual(descartes, []);
});

test('una candidata sin name se nombra de todas formas en el descarte', () => {
  const sinNombre = recetaValida({ id: 'sin-nombre', name: '' });

  const { elegida, descartes } = elegirCandidata([sinNombre]);

  assert.equal(elegida, null);
  assert.equal(descartes.length, 1);
  assert.ok(
    esTextoConContenido(descartes[0].nombre),
    'un descarte sin nombre no se puede leer en el log de Actions',
  );
});

function esTextoConContenido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}
