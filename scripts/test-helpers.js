/**
 * Utilidades compartidas por los archivos de prueba de `scripts/`.
 * No forma parte de la web: `vite` solo empaqueta `src/`.
 */

/** Una receta completa y válida. Devuelve un objeto nuevo en cada llamada. */
export function recetaValida(sobrescribe = {}) {
  return {
    id: 'cafe-de-prueba',
    name: 'Café de Prueba',
    category: 'clasicos',
    categoryName: 'Clásicos de Cafetería',
    origin: 'Italia (Milán)',
    difficulty: 'Intermedio',
    time: '25-30 seg',
    timeMinutes: 1,
    grindSize: 'Fina (Fine Espresso)',
    ratio: '1:2',
    coffeeGrams: 18,
    waterMl: 36,
    temp: '92°C - 94°C',
    flavorNotes: ['Chocolate amargo', 'Caramelo tostado'],
    tags: ['espresso', 'italia', 'intenso'],
    image: 'https://images.unsplash.com/photo-1514432324607',
    shortDesc: 'Un espresso de referencia para calibrar el molino.',
    longDesc: 'La base de casi todas las bebidas de cafetería italianas.',
    ingredients: [
      { item: 'Café de especialidad en grano', amount: '18g', baseQty: 18, unit: 'g' },
      { item: 'Agua filtrada a 93°C', amount: '36ml', baseQty: 36, unit: 'ml' },
    ],
    steps: ['Muele el café fino.', 'Extrae en 25-30 segundos.'],
    baristaTip: 'Si corre demasiado rápido, aprieta la molienda.',
    source: 'Istituto Nazionale Espresso Italiano',
    ...sobrescribe,
  };
}
