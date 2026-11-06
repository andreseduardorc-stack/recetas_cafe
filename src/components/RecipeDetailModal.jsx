import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Clock, 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Share2, 
  Lightbulb, 
  Scale, 
  Coffee, 
  Droplet, 
  Layers, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RecipeDetailModal = ({ recipe, onClose, onOpenAuthModal }) => {
  const { isFavorite, toggleFavorite, showToast } = useAuth();
  const saved = recipe ? isFavorite(recipe.id) : false;

  // Servings / Portion scaler state
  const [servings, setServings] = useState(1);

  // Barista extraction timer state
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Completed steps checklist
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!recipe) return null;

  const handleFavoriteClick = () => {
    const success = toggleFavorite(recipe.id);
    if (!success) {
      onOpenAuthModal();
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace de la receta copiado al portapapeles 📋', 'success');
    }
  };

  const toggleStep = (stepIdx) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIdx) ? prev.filter((i) => i !== stepIdx) : [...prev, stepIdx]
    );
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div class="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100">
        
        {/* Header Bar */}
        <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            title="Compartir receta"
            class="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md text-stone-300 border border-stone-700 hover:text-amber-400 transition-colors shadow-lg"
          >
            <Share2 class="w-4 h-4" />
          </button>

          {/* Favorite */}
          <button
            onClick={handleFavoriteClick}
            title={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            class={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 shadow-lg ${
              saved
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 border-stone-700 hover:text-rose-400'
            }`}
          >
            <Heart class={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Cerrar"
            class="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md text-stone-300 border border-stone-700 hover:text-white transition-colors shadow-lg"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div class="overflow-y-auto divide-y divide-stone-800/80">
          
          {/* Hero Banner Section */}
          <div class="relative h-64 sm:h-80 w-full bg-stone-950">
            <img
              src={recipe.image}
              alt={recipe.name}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
            
            <div class="absolute bottom-6 left-6 right-6">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-stone-950">
                  {recipe.categoryName}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-stone-900/80 backdrop-blur-sm text-stone-300 border border-stone-700">
                  {recipe.origin}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-stone-900/80 backdrop-blur-sm text-amber-300 border border-stone-700">
                  Dificultad: {recipe.difficulty}
                </span>
              </div>
              <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {recipe.name}
              </h1>
            </div>
          </div>

          {/* Technical Specs Strip (SCA Standard) */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-stone-950/50">
            <div class="bg-stone-900/80 p-3 rounded-xl border border-stone-800 flex items-center gap-3">
              <Scale class="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div class="text-[11px] text-stone-400 uppercase font-semibold">Ratio SCA</div>
                <div class="text-xs sm:text-sm font-bold text-stone-200">{recipe.ratio}</div>
              </div>
            </div>

            <div class="bg-stone-900/80 p-3 rounded-xl border border-stone-800 flex items-center gap-3">
              <Coffee class="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div class="text-[11px] text-stone-400 uppercase font-semibold">Molienda</div>
                <div class="text-xs sm:text-sm font-bold text-stone-200">{recipe.grindSize}</div>
              </div>
            </div>

            <div class="bg-stone-900/80 p-3 rounded-xl border border-stone-800 flex items-center gap-3">
              <Clock class="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div class="text-[11px] text-stone-400 uppercase font-semibold">Tiempo Total</div>
                <div class="text-xs sm:text-sm font-bold text-stone-200">{recipe.time}</div>
              </div>
            </div>

            <div class="bg-stone-900/80 p-3 rounded-xl border border-stone-800 flex items-center gap-3">
              <Flame class="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div class="text-[11px] text-stone-400 uppercase font-semibold">Temperatura</div>
                <div class="text-xs sm:text-sm font-bold text-stone-200">{recipe.temp}</div>
              </div>
            </div>
          </div>

          {/* Recipe Story / Intro */}
          <div class="p-6">
            <h2 class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Historia y Filosofía de la Receta
            </h2>
            <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
              {recipe.longDesc}
            </p>

            {/* Flavor Notes Tags */}
            <div class="flex items-center gap-2 mt-4 flex-wrap">
              <span class="text-xs text-stone-400">Perfil en taza:</span>
              {recipe.flavorNotes.map((note, idx) => (
                <span
                  key={idx}
                  class="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Scaler & Ingredients */}
          <div class="p-6 bg-stone-950/30">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Droplet class="w-5 h-5 text-amber-400" />
                  Ingredientes & Calculadora de Proporciones
                </h2>
                <p class="text-xs text-stone-400">Ajusta el número de tazas para recalcular las cantidades exactas.</p>
              </div>

              {/* Servings Pill buttons */}
              <div class="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1 self-start">
                <span class="text-xs text-stone-400 px-2 font-medium">Tazas:</span>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setServings(num)}
                    class={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      servings === num
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients List */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => {
                const scaledQty = ing.baseQty ? ing.baseQty * servings : null;
                return (
                  <div
                    key={idx}
                    class="flex items-center justify-between p-3 bg-stone-900/70 border border-stone-800/80 rounded-xl"
                  >
                    <span class="text-sm text-stone-200">{ing.item}</span>
                    <span class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      {scaledQty ? `${scaledQty} ${ing.unit}` : ing.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step by Step + Interactive Barista Timer */}
          <div class="p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Layers class="w-5 h-5 text-amber-400" />
                  Pasos de Preparación Barista
                </h2>
                <p class="text-xs text-stone-400">Haz clic en cada paso para marcarlo conforme avanzas.</p>
              </div>

              {/* Barista Stopwatch Timer Widget */}
              <div class="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-2xl border border-stone-800 self-start sm:self-auto shadow-inner">
                <div class="flex items-center gap-2">
                  <Clock class={`w-4 h-4 ${isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
                  <span class="font-mono text-lg font-bold text-stone-100 tracking-wider">
                    {formatTimer(seconds)}
                  </span>
                </div>
                <div class="flex items-center gap-1 pl-2 border-l border-stone-800">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    class={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-700 text-stone-950'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isTimerRunning ? <Pause class="w-3.5 h-3.5" /> : <Play class="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setSeconds(0);
                    }}
                    class="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Steps interactive list */}
            <div class="space-y-3">
              {recipe.steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    class={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isDone
                        ? 'bg-stone-950/60 border-stone-800 text-stone-500 line-through'
                        : 'bg-stone-900/60 hover:bg-stone-900 border-stone-800/80 text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <button class="mt-0.5 shrink-0 text-amber-500">
                      {isDone ? (
                        <CheckCircle2 class="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle class="w-5 h-5 text-stone-600 hover:text-amber-400" />
                      )}
                    </button>
                    <div class="flex-1">
                      <span class="text-xs font-semibold text-amber-500/90 mr-2">
                        Paso {idx + 1}:
                      </span>
                      <span class="text-sm leading-relaxed">{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barista Secret Tip Box */}
          {recipe.baristaTip && (
            <div class="p-6 bg-amber-950/20 border-t border-amber-900/30">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
                  <Lightbulb class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-amber-300">
                    Secreto del Barista Profesional
                  </h3>
                  <p class="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                    {recipe.baristaTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer of modal */}
          <div class="p-5 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <div>
              Fuente de la receta: <span class="text-stone-400">{recipe.source}</span>
            </div>
            <button
              onClick={onClose}
              class="w-full sm:w-auto px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl transition-colors"
            >
              Listo, cerrar receta
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
