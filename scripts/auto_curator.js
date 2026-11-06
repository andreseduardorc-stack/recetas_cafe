import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const recipesFilePath = path.join(rootDir, 'src', 'data', 'recipesData.js');

// Discovery Pool of World Coffee Recipes to feed the encyclopedia
const DISCOVERY_POOL = [
  {
    id: 'cafe-touba-senegal',
    name: 'Café Touba Tradicional de Senegal',
    category: 'especiales',
    categoryName: 'Especiales & De Autor',
    origin: 'Senegal (Hermandad Murid, Cheikh Amadou Bamba)',
    difficulty: 'Fácil',
    time: '5 min',
    timeMinutes: 5,
    grindSize: 'Media-Gruesa',
    ratio: '1:12 (25g café con djar -> 300g agua)',
    coffeeGrams: 25,
    waterMl: 300,
    temp: '95°C',
    flavorNotes: ['Pimienta de Selim ahumada', 'Clavo dulce', 'Picante sutil', 'Estimulante'],
    tags: ['senegal', 'touba', 'especias', 'pimienta djar', 'africa', 'tradicional', 'intenso'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'La bebida sagrada de Touba: granos de café tostados con pimienta de Guinea (Djar) y clavo de olor con un remate especiado y medicinal.',
    longDesc: 'Creado a finales del siglo XIX por el líder sufí Cheikh Amadou Bamba, el Café Touba combina café Robusta tostado muy oscuro con "djar" (semillas secas de Xylopia aethiopica) molidas. Se prepara mediante filtrado por goteo tradicional en bolsa de tela pasando el líquido de jarra en jarra para oxigenar.',
    ingredients: [
      { item: 'Café tostado oscuro molido', amount: '20g', baseQty: 20, unit: 'g' },
      { item: 'Pimienta de Guinea (Djar) y clavo molidos', amount: '5g (1 cdita)', baseQty: 5, unit: 'g' },
      { item: 'Agua muy caliente (95°C)', amount: '300ml', baseQty: 300, unit: 'ml' },
      { item: 'Azúcar moreno al gusto', amount: '10g (opcional)', baseQty: 10, unit: 'g' }
    ],
    steps: [
      'Mezcla el café molido medio-grueso con las especias djar y clavo trituradas.',
      'Coloca la mezcla en un filtro cónico o manga de tela tradicional.',
      'Vierte los 300ml de agua caliente lentamente en círculos para empapar las especias.',
      'Recoge la extracción y viértela de nuevo a través del filtro una segunda vez para intensificar el sabor.',
      'Pasa el café de un vaso a otro a cierta altura creando una capa ligera de espuma antes de servir bien caliente.'
    ],
    baristaTip: 'El Djar contiene aceites esenciales con propiedades digestivas y broncodilatadoras, otorgando un efecto vigorizante mucho más prolongado que el café común.',
    source: 'Patrimonio Cultural y Culinario de África Occidental'
  },
  {
    id: 'ca-phe-trung-hanoi',
    name: 'Cà Phê Trứng (Café con Huevo de Hanói)',
    category: 'especiales',
    categoryName: 'Especiales & De Autor',
    origin: 'Hanói, Vietnam (Café Giảng, 1946)',
    difficulty: 'Intermedio',
    time: '6 min',
    timeMinutes: 6,
    grindSize: 'Media (Filtro Phin)',
    ratio: '1 shot café robusta denso + crema batida de yema y leche condensada',
    coffeeGrams: 20,
    waterMl: 60,
    temp: 'Caliente',
    flavorNotes: ['Natilla de tiramisú', 'Dulzura aterciopelada', 'Café robusta oscuro', 'Cremoso'],
    tags: ['vietnam', 'hanoi', 'phin', 'huevo', 'dulce', 'postre', 'cremoso', 'asia'],
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'La joya dulce de Vietnam: una crema batida espumosa de yema de huevo y leche condensada flotando sobre café negro intenso extraído en filtro Phin.',
    longDesc: 'Inventado por Nguyen Van Giang en el famoso Café Giảng durante la Guerra de Indochina cuando la leche fresca escaseaba. Sustituyó la leche por yema de huevo batida a punto de nieve con azúcar, creando una bebida similar a un tiramisú bebible que hoy fascina al mundo entero.',
    ingredients: [
      { item: 'Café molido vietnamita de tueste oscuro (Robusta)', amount: '20g', baseQty: 20, unit: 'g' },
      { item: 'Agua a 95°C', amount: '60ml', baseQty: 60, unit: 'ml' },
      { item: 'Yema de huevo fresco', amount: '1 unidad', baseQty: 1, unit: 'unidad' },
      { item: 'Leche condensada', amount: '20ml', baseQty: 20, unit: 'ml' },
      { item: 'Extracto de vainilla natural', amount: '1/2 cucharadita', baseQty: 2, unit: 'ml' }
    ],
    steps: [
      'Extrae el café negro bien concentrado utilizando un filtro de goteo tradicional Phin vietnamita (o cafetera italiana/moka).',
      'En un cuenco hondo, coloca la yema de huevo, la leche condensada y la vainilla.',
      'Bate con varillas eléctricas a velocidad alta durante 3 a 4 minutos hasta obtener una crema espesa, aireada y de color amarillo pálido.',
      'Vierte el café caliente en una taza transparente precalentada.',
      'Coloca suavemente la crema de yema batida sobre la superficie; flotará como una nube esponjosa.',
      'Sírvelo colocando la taza dentro de un tazón pequeño con agua caliente para mantener la temperatura.'
    ],
    baristaTip: 'Bate la yema con suficiente vigor: si no incorpora suficiente aire, la crema se hundirá en el café en vez de flotar.',
    source: 'Café Giảng Archive & Vietnam Tourism Board'
  },
  {
    id: 'barraquito-canario',
    name: 'Barraquito Canario Auténtico',
    category: 'especiales',
    categoryName: 'Especiales & De Autor',
    origin: 'Islas Canarias, España (Tenerife)',
    difficulty: 'Fácil',
    time: '4 min',
    timeMinutes: 4,
    grindSize: 'Fina',
    ratio: 'Capas: Leche condensada + Licor 43 + Café solo + Espuma de leche',
    coffeeGrams: 16,
    waterMl: 35,
    milkMl: 80,
    temp: 'Caliente',
    flavorNotes: ['Vainilla y cítrico', 'Leche caramelizada', 'Contraste visual de 4 franjas', 'Canela'],
    tags: ['canarias', 'tenerife', 'espana', 'licor 43', 'leche condensada', 'visual', 'dulce'],
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'El café de cuatro capas más icónico de Tenerife: leche condensada en la base, Licor 43, espresso dorado y corona de microespuma con canela y limón.',
    longDesc: 'Se dice que un cliente habitual apodado "Barraco" pedía siempre este preparado especial en el Bar Imperial de Santa Cruz de Tenerife en los años 50. La diferencia de densidades crea un degradado perfecto en vaso estrecho de cristal.',
    ingredients: [
      { item: 'Leche condensada', amount: '25ml', baseQty: 25, unit: 'ml' },
      { item: 'Licor 43 (o Tía María)', amount: '15ml', baseQty: 15, unit: 'ml' },
      { item: 'Espresso corto intenso', amount: '35ml', baseQty: 35, unit: 'ml' },
      { item: 'Leche entera emulsionada caliente', amount: '80ml', baseQty: 80, unit: 'ml' },
      { item: 'Canela en polvo y corteza de limón fresco', amount: 'Para decorar', baseQty: 1, unit: 'twist' }
    ],
    steps: [
      'En un vaso alto y fino de cristal transparente, añade la leche condensada en el fondo (capa 1).',
      'Vierte el Licor 43 muy despacio sobre el dorso de una cuchara apoyada en el cristal para que repose sobre la leche condensada (capa 2).',
      'Extrae el shot de espresso y viértelo con el mismo cuidado con la cuchara para crear la tercera franja oscura.',
      'Vaporiza la leche y añade la espuma blanca densa en la parte superior (capa 4).',
      'Decora con un espolvoreado de canela molida y un trozo de corteza de limón colocada en el borde.'
    ],
    baristaTip: 'El truco para que las capas no se mezclen radica en la temperatura y el azúcar: los líquidos más dulces y densos van abajo, los calientes y ligeros arriba.',
    source: 'Tradición Gastronómica de las Islas Canarias'
  },
  {
    id: 'yuenyeung-hong-kong',
    name: 'Yuenyeung (Café con Té con Leche de Hong Kong)',
    category: 'especiales',
    categoryName: 'Especiales & De Autor',
    origin: 'Hong Kong (Cha Chaan Teng)',
    difficulty: 'Fácil',
    time: '5 min',
    timeMinutes: 5,
    grindSize: 'Media',
    ratio: '3 partes café negro + 7 partes té negro de Ceilán con leche evaporada',
    coffeeGrams: 15,
    waterMl: 100,
    temp: 'Caliente o con hielo',
    flavorNotes: ['Té negro astringente suave', 'Cremoso lácteo', 'Tostado de café', 'Bebida reconfortante'],
    tags: ['hong kong', 'yuenyeung', 'te con leche', 'cha chaan teng', 'fusion', 'frio o caliente'],
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'La legendaria bebida de los comensales de Hong Kong: una unión armónica de café recién hecho con el tradicional té con leche condensada y evaporada.',
    longDesc: '"Yuenyeung" hace referencia al pato mandarín en la cultura cantonesa, símbolo de parejas unidas a pesar de sus diferencias. Es la bebida insigne de los tradicionales comensales Cha Chaan Teng que combina la cafeína vigorizante del café con los taninos florales del té negro.',
    ingredients: [
      { item: 'Café negro filtrado intenso recién hecho', amount: '80ml', baseQty: 80, unit: 'ml' },
      { item: 'Té negro concentrado (Ceilán o Assam macerado fuerte)', amount: '120ml', baseQty: 120, unit: 'ml' },
      { item: 'Leche evaporada entera', amount: '50ml', baseQty: 50, unit: 'ml' },
      { item: 'Azúcar o leche condensada al gusto', amount: '15ml', baseQty: 15, unit: 'ml' }
    ],
    steps: [
      'Prepara un té negro muy concentrado hirviendo hojas de té Ceilán en agua durante 4 minutos.',
      'Cuela el té usando una manga de tela fina varias veces al estilo "té de pantimedias" de Hong Kong.',
      'Mezcla el té caliente con la leche evaporada y el azúcar o leche condensada.',
      'Prepara el café negro bien aromático.',
      'Combina el café con el té con leche en una proporción aproximada de 30% café y 70% té con leche.',
      'Sirve humeante en taza gruesa o viértelo sobre cubos de hielo para la versión veraniega Iced Yuenyeung.'
    ],
    baristaTip: 'El secreto está en usar leche evaporada (no leche común fresca), ya que le aporta esa densidad característica y textura de seda.',
    source: 'Hong Kong Living Heritage & Intangible Cultural Registry'
  },
  {
    id: 'kaffeost-escandinavo',
    name: 'Kaffeost Escandinavo (Café con Queso Ártico)',
    category: 'salud',
    categoryName: 'Salud & Alternativos',
    origin: 'Laponia (Suecia y Finlandia, pueblo Sami)',
    difficulty: 'Fácil',
    time: '3 min',
    timeMinutes: 3,
    grindSize: 'Gruesa (Kokkaffe en tetera sobre fuego)',
    ratio: '1 taza de café negro filtrado caliente + dados de queso Leipäjuusto',
    coffeeGrams: 20,
    waterMl: 250,
    temp: 'Muy caliente (95°C)',
    flavorNotes: ['Salado sutil', 'Queso fundente esponjoso', 'Tostado acaramelado', 'Calidez polar'],
    tags: ['suecia', 'finlandia', 'sami', 'queso', 'kaffeost', 'curioso', 'artico'],
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'La ancestral tradición sami de Laponia: dados de queso de cuajada horneado (Juustoleipä) sumergidos en café caliente que absorben los aromas como una esponja.',
    longDesc: 'Una de las costumbres cafeteras más fascinantes de Europa del Norte. En las heladas tundras árticas, el queso de reno o vaca se hornea previamente para crear una corteza tostada y se corta en dados dentro de la taza de abedul tallada (Kuksa) antes de verter café hirviendo.',
    ingredients: [
      { item: 'Café caliente de filtro o prensa francesa tueste medio', amount: '220ml', baseQty: 220, unit: 'ml' },
      { item: 'Queso de cuajada horneado (Leipäjuusto / Juustoleipä o Halloumi suave)', amount: '40g en cubitos', baseQty: 40, unit: 'g' }
    ],
    steps: [
      'Corta el queso horneado en cubitos de aproximadamente 1 cm de lado.',
      'Coloca los dados en el fondo de una taza de madera kuksa o taza de cerámica.',
      'Vierte café negro recién filtrado muy caliente directamente sobre los dados de queso.',
      'Deja reposar 2 minutos para que el queso se caliente, ablande y absorba el café como una esponja elástica.',
      'Bebe el café aromatizado con notas lácteas y salinas suaves, y luego come los dados de queso con una cucharilla.'
    ],
    baristaTip: 'El queso Leipäjuusto no se disuelve ni enturbia el café; al calentarse adquiere una textura chirriante ("squeaky") similar al marshmallow salado.',
    source: 'Sami Culinary Heritage & Nordic Food Lab'
  },
  {
    id: 'bicerin-turin',
    name: 'Bicerin Histórico de Turín',
    category: 'clasicos',
    categoryName: 'Clásicos de Cafetería',
    origin: 'Turín, Italia (Caffè Al Bicerin, 1763)',
    difficulty: 'Intermedio',
    time: '5 min',
    timeMinutes: 5,
    grindSize: 'Fina',
    ratio: '1/3 Chocolate caliente amargo + 1/3 Espresso + 1/3 Nata semibatida fría',
    coffeeGrams: 16,
    waterMl: 35,
    temp: 'Caliente con corona fría',
    flavorNotes: ['Chocolate gianduja fundido', 'Cacao oscuro', 'Espresso denso', 'Nata fresca sedosa'],
    tags: ['turin', 'italia', 'bicerin', 'chocolate', 'historico', 'postre', 'clasico'],
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80',
    shortDesc: 'La histórica bebida de Turín adorada por Cavour y Alejandro Dumas: capas perfectas de chocolate espeso piamontés, café espresso y crema fresca.',
    longDesc: 'Servido ininterrumpidamente desde 1763 en la Piazza della Consolata de Turín, el Bicerin es una institución de la confitería piamontesa. A diferencia de un mocaccino común, el chocolate caliente artesanal se prepara denso como un pudding antes de recibir el espresso.',
    ingredients: [
      { item: 'Chocolate negro puro (70%) fundido con un toque de leche (espeso)', amount: '60ml', baseQty: 60, unit: 'ml' },
      { item: 'Espresso doble recién extraído', amount: '35ml', baseQty: 35, unit: 'ml' },
      { item: 'Nata fresca para batir fría (35% M.G.)', amount: '40ml ligeramente montada', baseQty: 40, unit: 'ml' }
    ],
    steps: [
      'Prepara un chocolate a la taza caliente, denso y oscuro en un cazo.',
      'Sírvelo en el primer tercio de un vaso de cristal bajo con pie tradicional.',
      'Extrae el espresso caliente y viértelo cuidadosamente sobre el dorso de una cuchara para que repose encima del chocolate.',
      'Bate la nata fría ligeramente a mano hasta que espese pero conserve fluidez.',
      'Cubre con la nata fría creando un contraste perfecto de color y temperatura.',
      '¡No lo revuelvas! El Bicerin se bebe caliente a través de la capa fría de nata.'
    ],
    baristaTip: 'El ritual del Bicerin exige no remover nunca la copa con la cuchara para que cada trago pase de la suavidad láctea al vigor del café y finalmente al dulzor del cacao.',
    source: 'Caffè Al Bicerin dal 1763 (Torino)'
  }
];

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

async function runAutoCurator() {
  console.log('🤖 Iniciando CaféPedia Auto-Curator Bot...');

  if (!fs.existsSync(recipesFilePath)) {
    console.error('❌ No se encontró el archivo recipesData.js');
    process.exit(1);
  }

  let fileContent = fs.readFileSync(recipesFilePath, 'utf-8');

  // Match existing IDs and names (support both raw key and quoted key)
  const existingIdMatches = [...fileContent.matchAll(/(?:id|"id"):\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const existingNameMatches = [...fileContent.matchAll(/(?:name|"name"):\s*['"]([^'"]+)['"]/g)].map(m => normalize(m[1]));

  console.log(`📊 Recetas actuales en la enciclopedia: ${existingIdMatches.length}`);

  // Find candidate recipes from discovery pool not yet present
  const candidates = DISCOVERY_POOL.filter(candidate => {
    const isIdDuplicate = existingIdMatches.includes(candidate.id);
    const isNameDuplicate = existingNameMatches.includes(normalize(candidate.name));
    return !isIdDuplicate && !isNameDuplicate;
  });

  if (candidates.length === 0) {
    console.log('✨ La enciclopedia ya cuenta con todas las recetas curadas de esta fase. ¡Al día!');
    return;
  }

  // Select next candidate
  const toAdd = candidates[0];
  console.log(`🎯 Seleccionada para incorporar hoy: "${toAdd.name}" (${toAdd.origin})`);

  // Target the end bracket of RECIPES_DATA
  const closingRegex = /\n\];\s*\n\s*\/\/\s*Helper to extract unique tags/;
  const match = fileContent.match(closingRegex);

  if (!match) {
    console.error('❌ No se encontró el marcador de cierre en recipesData.js');
    process.exit(1);
  }

  const recipeJson = JSON.stringify(toAdd, null, 2)
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');

  // Check if content right before closing bracket needs a comma
  const beforeClosing = fileContent.slice(0, match.index).trimEnd();
  const needsComma = !beforeClosing.endsWith(',');

  const insertText = (needsComma ? ',\n' : '\n') + recipeJson + '\n';
  fileContent = fileContent.slice(0, match.index) + insertText + fileContent.slice(match.index);

  fs.writeFileSync(recipesFilePath, fileContent, 'utf-8');
  console.log(`✅ ¡Receta "${toAdd.name}" agregada con éxito a recipesData.js!`);

  // Run the build to update dist/ and copy to docs/
  console.log('🔨 Recompilando la aplicación para producción y actualizando /docs...');
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    console.log('🚀 Compilación lista y sincronizada con /docs para GitHub Pages.');
  } catch (err) {
    console.error('⚠️ Error al compilar tras agregar la receta:', err.message);
    process.exit(1);
  }
}

runAutoCurator();
