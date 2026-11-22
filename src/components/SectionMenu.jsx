import React from 'react';
import { 
  Sparkles, 
  Coffee, 
  Flame, 
  Sun, 
  Wand2, 
  HeartPulse, 
  Bookmark, 
  SlidersHorizontal,
  Clock,
  Layers
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Coffee,
  Flame,
  Sun,
  Wand2,
  HeartPulse,
  Bookmark
};

export const SectionMenu = ({
  activeCategory,
  onSelectCategory,
  categories,
  categoryCounts,
  difficultyFilter,
  setDifficultyFilter,
  timeFilter,
  setTimeFilter,
  sortBy,
  setSortBy,
  favoritesCount
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-800/80">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Coffee;
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'favoritos' ? favoritesCount : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-600/25 scale-[1.02]'
                  : 'bg-stone-900/60 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800/60 hover:border-stone-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
              <span>{cat.label}</span>
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-stone-950/20 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-filters Bar: Difficulty, Time, Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 bg-stone-900/40 p-3 rounded-xl border border-stone-800/50">
        
        {/* Difficulty pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-stone-400 mr-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Dificultad:
          </span>
          {['todos', 'Fácil', 'Intermedio', 'Avanzado'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 rounded-lg transition-colors capitalize ${
                difficultyFilter === diff
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {diff === 'todos' ? 'Cualquiera' : diff}
            </button>
          ))}
        </div>

        {/* Time filters & Sorting */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Filter */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              aria-label="Filtrar por tiempo de preparación"
              className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-1 border border-stone-700/60 focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Cualquier tiempo</option>
              <option value="rapido">Rápidos (≤ 3 min)</option>
              <option value="medio">Medio (3 a 10 min)</option>
              <option value="lento">Maceración / Lentos (&gt; 10 min)</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Ordenar recetas"
              className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-1 border border-stone-700/60 focus:outline-none focus:border-amber-500"
            >
              <option value="destacados">Orden: Recomendados</option>
              <option value="rapidos">Más Rápidos primero</option>
              <option value="nombre">Alfabético (A - Z)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

