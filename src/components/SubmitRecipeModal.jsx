import React, { useState } from 'react';
import { X, Plus, Trash2, Coffee, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SubmitRecipeModal = ({ isOpen, onClose, onOpenAuthModal }) => {
  const { user, addCustomRecipe } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('clasicos');
  const [origin] = useState('Internacional / Receta Web');
  const [difficulty, setDifficulty] = useState('Intermedio');
  const [time, setTime] = useState('4 min');
  const [grindSize, setGrindSize] = useState('Media');
  const [ratio, setRatio] = useState('1:15');
  const [temp] = useState('92°C');
  const [shortDesc, setShortDesc] = useState('');
  const [baristaTip, setBaristaTip] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // Dynamic ingredients
  const [ingredients, setIngredients] = useState([
    { item: 'Café de especialidad', amount: '18g', baseQty: 18, unit: 'g' },
    { item: 'Agua purificada caliente', amount: '270ml', baseQty: 270, unit: 'ml' }
  ]);

  // Dynamic steps
  const [steps, setSteps] = useState([
    'Moler el café con la granularidad recomendada.',
    'Verter el agua en movimientos circulares constantes.'
  ]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
        <div class="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center">
          <div class="p-3 bg-amber-500/10 rounded-2xl w-fit mx-auto text-amber-400 mb-3">
            <Coffee class="w-8 h-8" />
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Inicia Sesión para Contribuir</h2>
          <p class="text-xs text-stone-400 mb-5 leading-relaxed">
            Para publicar una receta encontrada en internet y asociarla a tu perfil de barista, necesitas tener una sesión iniciada.
          </p>
          <div class="flex gap-2">
            <button
              onClick={onClose}
              class="flex-1 py-2.5 bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              class="flex-1 py-2.5 bg-amber-600 text-stone-950 rounded-xl text-xs font-bold hover:bg-amber-500"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', baseQty: 0, unit: 'g' }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || ingredients.length === 0 || steps.length === 0) return;

    const newRecipe = {
      name,
      category,
      categoryName: category === 'clasicos' ? 'Clásicos de Cafetería' : category === 'filtrados' ? 'Filtrados Manuales' : category === 'frios' ? 'Cafés Fríos & Iced' : 'Especiales & De Autor',
      origin: origin || 'Internet / Internacional',
      difficulty,
      time,
      timeMinutes: 4,
      grindSize,
      ratio,
      temp,
      shortDesc: shortDesc || 'Receta de café descubierta en la web y aportada a la enciclopedia.',
      longDesc: `${shortDesc} Receta agregada por el barista ${user.name} para la comunidad mundial de CaféPedia.`,
      flavorNotes: ['Aromático', 'Equilibrado', 'Casero'],
      tags: [name.toLowerCase(), category, 'comunidad', 'web'],
      ingredients: ingredients.filter(i => i.item.trim() !== ''),
      steps: steps.filter(s => s.trim() !== ''),
      baristaTip: baristaTip || 'Respeta la temperatura del agua para evitar sobreextracción.',
      source: sourceUrl || `Aportado por ${user.name}`
    };

    addCustomRecipe(newRecipe);
    onClose();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div class="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto text-stone-100">
        
        <button
          onClick={onClose}
          class="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="mb-6">
          <div class="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Globe class="w-4 h-4" />
            Aporte a la Enciclopedia Mundial
          </div>
          <h2 class="text-2xl font-bold text-white">Agregar Receta de Internet</h2>
          <p class="text-xs text-stone-400 mt-1">
            Comparte esa receta única que encontraste en un blog, foro o cafetería.
          </p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Nombre de la Receta</label>
              <input
                type="text"
                required
                placeholder="Ej. Café Miel de Costa Rica"
                value={name}
                onChange={(e) => setName(e.target.value)}
                class="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                class="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-stone-200"
              >
                <option value="clasicos">Clásicos de Cafetería</option>
                <option value="filtrados">Filtrados Manuales (Pour Over)</option>
                <option value="frios">Cafés Fríos & Iced</option>
                <option value="especiales">Especiales & De Autor</option>
                <option value="salud">Salud & Alternativos</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-stone-400 mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                class="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs"
              >
                <option value="Fácil">Fácil</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-stone-400 mb-1">Tiempo</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ej. 4 min"
                class="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs"
              />
            </div>

            <div>
              <label class="block text-xs text-stone-400 mb-1">Ratio (SCA)</label>
              <input
                type="text"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                placeholder="1:15"
                class="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs"
              />
            </div>

            <div>
              <label class="block text-xs text-stone-400 mb-1">Molienda</label>
              <input
                type="text"
                value={grindSize}
                onChange={(e) => setGrindSize(e.target.value)}
                placeholder="Media-Fina"
                class="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">Breve Descripción</label>
            <textarea
              rows="2"
              required
              placeholder="¿Qué hace especial a esta receta y cómo sabe?"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              class="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Dynamic Ingredients */}
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-stone-300">Ingredientes Requeridos</label>
              <button
                type="button"
                onClick={handleAddIngredient}
                class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Plus class="w-3.5 h-3.5" /> Agregar ingrediente
              </button>
            </div>
            <div class="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} class="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ingrediente (ej. Miel de abeja pura)"
                    value={ing.item}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].item = e.target.value;
                      setIngredients(updated);
                    }}
                    class="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Cantidad (ej. 20ml)"
                    value={ing.amount}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].amount = e.target.value;
                      setIngredients(updated);
                    }}
                    class="w-32 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      class="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Steps */}
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-stone-300">Pasos de Preparación</label>
              <button
                type="button"
                onClick={handleAddStep}
                class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Plus class="w-3.5 h-3.5" /> Agregar paso
              </button>
            </div>
            <div class="space-y-2">
              {steps.map((st, idx) => (
                <div key={idx} class="flex items-center gap-2">
                  <span class="text-xs font-mono text-amber-500 w-6">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder={`Instrucción para el paso ${idx + 1}...`}
                    value={st}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[idx] = e.target.value;
                      setSteps(updated);
                    }}
                    class="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      class="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Tip Secreto del Barista</label>
              <input
                type="text"
                placeholder="Consejo para no arruinar la taza"
                value={baristaTip}
                onChange={(e) => setBaristaTip(e.target.value)}
                class="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Fuente / URL de internet</label>
              <input
                type="text"
                placeholder="Ej. https://coffee-blog.com/receta"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                class="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-600/20"
          >
            Publicar Receta en la Enciclopedia
          </button>
        </form>
      </div>
    </div>
  );
};
