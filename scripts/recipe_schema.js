/**
 * Validador de forma de las recetas de CaféPedia.
 *
 * Módulo puro: no lee archivos, no imprime, nunca lanza. Solo responde si un objeto
 * tiene forma de receta. El porqué de cada regla está en
 * `specs/2026-11-21-validador-esquema-recetas-design.md`.
 */

/** Las cinco categorías de receta, con el `categoryName` que le toca a cada una. */
export const CATEGORIAS_VALIDAS = {
  clasicos: 'Clásicos de Cafetería',
  filtrados: 'Filtrados y Cafeteras Manuales',
  frios: 'Cafés Fríos & Iced',
  especiales: 'Especiales & De Autor',
  salud: 'Salud & Alternativos',
};

const DIFICULTADES_VALIDAS = ['Fácil', 'Intermedio', 'Avanzado'];

const ID_KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Campos de texto obligatorios que no tienen más regla que no venir vacíos. */
const CAMPOS_DE_TEXTO = [
  'name',
  'categoryName',
  'origin',
  'time',
  'grindSize',
  'ratio',
  'temp',
  'image',
  'shortDesc',
  'longDesc',
  'baristaTip',
  'source',
];

/** Arrays obligatorios de cadenas no vacías. */
const CAMPOS_DE_LISTA = ['flavorNotes', 'tags', 'steps'];

/** Números opcionales: si la clave viene, tiene que ser un número usable. */
const CAMPOS_NUMERICOS_OPCIONALES = ['coffeeGrams', 'waterMl', 'milkMl'];

function esTextoConContenido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

/** Descarta de un golpe las cadenas numéricas, NaN, Infinity y los negativos. */
function esNumeroUsable(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

function esObjetoPlano(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function validarIngrediente(ingrediente, indice, errors) {
  const donde = `ingredients[${indice}]`;

  if (!esObjetoPlano(ingrediente)) {
    errors.push(`${donde}: se esperaba un objeto`);
    return;
  }

  if (!esTextoConContenido(ingrediente.item)) {
    errors.push(`${donde}.item: se esperaba un texto con contenido`);
  }
  if (!esTextoConContenido(ingrediente.amount)) {
    errors.push(`${donde}.amount: se esperaba un texto con contenido`);
  }

  // baseQty y unit alimentan la calculadora de proporciones: o vienen los dos, o ninguno.
  const tieneBaseQty = ingrediente.baseQty !== undefined;
  const tieneUnit = ingrediente.unit !== undefined;

  if (tieneBaseQty !== tieneUnit) {
    errors.push(`${donde}: baseQty y unit van juntos o no van ninguno de los dos`);
    return;
  }
  if (!tieneBaseQty) return;

  if (!esNumeroUsable(ingrediente.baseQty)) {
    errors.push(`${donde}.baseQty: se esperaba un número mayor que 0`);
  }
  if (!esTextoConContenido(ingrediente.unit)) {
    errors.push(`${donde}.unit: se esperaba un texto con contenido`);
  }
}

/**
 * Comprueba que un objeto tiene forma de receta.
 * @param {unknown} receta
 * @returns {{ ok: boolean, errors: string[] }} todos los errores, no solo el primero
 */
export function validateRecipe(receta) {
  if (!esObjetoPlano(receta)) {
    return { ok: false, errors: ['la receta: se esperaba un objeto'] };
  }

  const errors = [];

  // --- id
  if (!esTextoConContenido(receta.id)) {
    errors.push('id: se esperaba un texto con contenido');
  } else if (!ID_KEBAB_CASE.test(receta.id)) {
    errors.push(`id: "${receta.id}" no está en kebab-case (minúsculas y guiones)`);
  }

  // --- textos obligatorios
  for (const campo of CAMPOS_DE_TEXTO) {
    if (!esTextoConContenido(receta[campo])) {
      errors.push(`${campo}: se esperaba un texto con contenido`);
    }
  }

  // --- listas obligatorias
  for (const campo of CAMPOS_DE_LISTA) {
    const valor = receta[campo];
    if (!Array.isArray(valor) || valor.length === 0) {
      errors.push(`${campo}: se esperaba un array no vacío de cadenas`);
    } else if (!valor.every(esTextoConContenido)) {
      errors.push(`${campo}: todos sus elementos tienen que ser textos con contenido`);
    }
  }

  // --- difficulty
  if (!DIFICULTADES_VALIDAS.includes(receta.difficulty)) {
    errors.push(`difficulty: se esperaba una de ${DIFICULTADES_VALIDAS.join(', ')}`);
  }

  // --- category y su categoryName
  const categoryNameEsperado = CATEGORIAS_VALIDAS[receta.category];
  if (categoryNameEsperado === undefined) {
    errors.push(
      `category: se esperaba una de ${Object.keys(CATEGORIAS_VALIDAS).join(', ')}`,
    );
  } else if (receta.categoryName !== categoryNameEsperado) {
    errors.push(
      `categoryName: con category "${receta.category}" se esperaba "${categoryNameEsperado}"`,
    );
  }

  // --- timeMinutes
  if (!esNumeroUsable(receta.timeMinutes)) {
    errors.push('timeMinutes: se esperaba un número mayor que 0');
  }

  // --- ingredients
  if (!Array.isArray(receta.ingredients) || receta.ingredients.length === 0) {
    errors.push('ingredients: se esperaba un array no vacío');
  } else {
    receta.ingredients.forEach((ingrediente, indice) =>
      validarIngrediente(ingrediente, indice, errors),
    );
  }

  // --- números opcionales
  for (const campo of CAMPOS_NUMERICOS_OPCIONALES) {
    if (receta[campo] !== undefined && !esNumeroUsable(receta[campo])) {
      errors.push(`${campo}: si viene, se esperaba un número mayor que 0`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Valida un conjunto de recetas y comprueba además que no haya ids repetidos.
 * @param {unknown} recetas
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateAll(recetas) {
  if (!Array.isArray(recetas)) {
    return { ok: false, errors: ['se esperaba un array de recetas'] };
  }

  const errors = [];
  const vistos = new Set();

  recetas.forEach((receta, indice) => {
    const etiqueta = esObjetoPlano(receta) && receta.id ? receta.id : 'sin id';

    for (const error of validateRecipe(receta).errors) {
      errors.push(`[${indice}] ${etiqueta}: ${error}`);
    }

    if (etiqueta !== 'sin id') {
      if (vistos.has(etiqueta)) {
        errors.push(`[${indice}] ${etiqueta}: id duplicado`);
      }
      vistos.add(etiqueta);
    }
  });

  return { ok: errors.length === 0, errors };
}
