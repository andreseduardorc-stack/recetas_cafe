/**
 * Decide qué candidata incorpora el bot curador.
 *
 * Módulo puro: no escribe archivos ni imprime. El bot se queda con `elegida` y
 * se encarga de contar los `descartes` en el log.
 */

import { validateRecipe } from './recipe_schema.js';

/**
 * Devuelve la primera candidata que pasa el validador, y las que se descartaron
 * por el camino. No mira más allá de la primera válida.
 *
 * @param {Array<unknown>} candidatas
 * @returns {{ elegida: object|null, descartes: Array<{ nombre: string, errores: string[] }> }}
 */
export function elegirCandidata(candidatas) {
  const descartes = [];

  for (const candidata of candidatas) {
    const { ok, errors } = validateRecipe(candidata);
    if (ok) return { elegida: candidata, descartes };

    descartes.push({ nombre: nombrar(candidata), errores: errors });
  }

  return { elegida: null, descartes };
}

/** Un nombre legible para el log, aunque la receta venga sin `name` ni `id`. */
function nombrar(candidata) {
  if (typeof candidata !== 'object' || candidata === null) return 'una candidata sin forma';

  for (const campo of [candidata.name, candidata.id]) {
    if (typeof campo === 'string' && campo.trim() !== '') return campo;
  }
  return 'una candidata sin nombre';
}
