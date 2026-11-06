import React from 'react';
import { Heart, Clock, Globe2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RecipeCard = ({ recipe, onSelectRecipe, onOpenAuthModal }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const saved = isFavorite(recipe.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const success = toggleFavorite(recipe.id);
    if (!success) {
      onOpenAuthModal();
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'fácil':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      case 'intermedio':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      case 'avanzado':
        return 'bg-rose-950/70 text-rose-300 border-rose-800/60';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div
      onClick={() => onSelectRecipe(recipe)}
      class="group bg-stone-900/70 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image & Badges Container */}
      <div class="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-950">
        <img
          src={recipe.image}
          alt={recipe.name}
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

        {/* Top Badges */}
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
            {recipe.categoryName}
          </span>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            title={saved ? 'Quitar de favoritos' : 'Guardar en mis favoritos'}
            class={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 transform active:scale-90 ${
              saved
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40'
                : 'bg-stone-900/80 text-stone-300 border-stone-700 hover:text-rose-400 hover:bg-stone-900'
            }`}
          >
            <Heart class={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom stats inside image */}
        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-300">
          <div class="flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-stone-800">
            <Clock class="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.time}</span>
          </div>

          <div class="flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-stone-800">
            <Globe2 class="w-3.5 h-3.5 text-stone-400" />
            <span class="truncate max-w-[120px]">{recipe.origin}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Difficulty and Ratio */}
          <div class="flex items-center gap-2 mb-2.5">
            <span class={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            <span class="text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md">
              Ratio: {recipe.ratio}
            </span>
          </div>

          {/* Title */}
          <h3 class="text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1.5">
            {recipe.name}
          </h3>

          {/* Short Description */}
          <p class="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-4">
            {recipe.shortDesc}
          </p>
        </div>

        {/* Flavor Notes & Action */}
        <div>
          <div class="flex flex-wrap gap-1.5 mb-4">
            {recipe.flavorNotes.slice(0, 3).map((note, idx) => (
              <span
                key={idx}
                class="text-[10px] bg-stone-800/70 text-stone-300 px-2 py-0.5 rounded-md border border-stone-800"
              >
                {note}
              </span>
            ))}
          </div>

          <div class="pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs">
            <span class="text-stone-400 group-hover:text-stone-300">
              {recipe.ingredients.length} ingredientes • {recipe.steps.length} pasos
            </span>
            <span class="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver receta <ChevronRight class="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
