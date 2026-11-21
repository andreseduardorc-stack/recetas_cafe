import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { validateAll } from './recipe_schema.js';
import { elegirCandidata, normalizarNombre } from './curator_select.js';
import { DISCOVERY_POOL } from './discovery_pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const recipesFilePath = path.join(rootDir, 'src', 'data', 'recipesData.js');

async function runAutoCurator() {
  console.log('🤖 Iniciando CaféPedia Auto-Curator Bot...');

  if (!fs.existsSync(recipesFilePath)) {
    console.error('❌ No se encontró el archivo recipesData.js');
    process.exit(1);
  }

  // Si el validador rechaza lo que ya está publicado, el esquema está mal deducido:
  // sobra una regla. Se para antes de escribir nada.
  const { RECIPES_DATA } = await import('../src/data/recipesData.js');
  const publicadas = validateAll(RECIPES_DATA);
  if (!publicadas.ok) {
    console.error('❌ El validador rechaza recetas que ya están publicadas.');
    console.error('   El fallo está en el esquema, no en la receta nueva. No se escribe nada.');
    for (const error of publicadas.errors) console.error(`   · ${error}`);
    process.exit(1);
  }
  console.log(`✔️  Esquema conforme con las ${RECIPES_DATA.length} recetas publicadas.`);

  let fileContent = fs.readFileSync(recipesFilePath, 'utf-8');

  // Match existing IDs and names (support both raw key and quoted key)
  const existingIdMatches = [...fileContent.matchAll(/(?:id|"id"):\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const existingNameMatches = [...fileContent.matchAll(/(?:name|"name"):\s*['"]([^'"]+)['"]/g)].map(m => normalizarNombre(m[1]));

  console.log(`📊 Recetas actuales en la enciclopedia: ${existingIdMatches.length}`);

  // Find candidate recipes from discovery pool not yet present
  const candidates = DISCOVERY_POOL.filter(candidate => {
    const isIdDuplicate = existingIdMatches.includes(candidate.id);
    const isNameDuplicate = existingNameMatches.includes(normalizarNombre(candidate.name));
    return !isIdDuplicate && !isNameDuplicate;
  });

  if (candidates.length === 0) {
    console.log('✨ La enciclopedia ya cuenta con todas las recetas curadas de esta fase. ¡Al día!');
    return;
  }

  // Se queda con la primera candidata que pasa el validador; las demás se descartan
  // con su motivo a la vista en el log.
  const { elegida: toAdd, descartes } = elegirCandidata(candidates);

  for (const descarte of descartes) {
    console.warn(`⚠️ Descartada "${descarte.nombre}": ${descarte.errores.join('; ')}`);
  }

  if (!toAdd) {
    console.error(
      `❌ Ninguna de las ${descartes.length} candidatas pasó el validador. No se añade nada.`,
    );
    process.exit(1);
  }

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
