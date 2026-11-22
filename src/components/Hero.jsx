import React from 'react';
import { Sparkles, BookOpen, Coffee, Compass, BookmarkCheck } from 'lucide-react';
import { PredictiveSearchBar } from './PredictiveSearchBar';

export const Hero = ({ searchQuery, setSearchQuery, onSelectRecipe, allRecipes, totalRecipes }) => {
  return (
    <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 overflow-hidden text-center px-4 sm:px-6">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-orange-700/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Enciclopedia Abierta del Café de Especialidad</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-serif mb-5 leading-[1.15]">
          Todas las recetas de café <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            reunidas en un solo lugar.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Desde el espresso italiano de 9 bares y el método 4:6 en V60, hasta cold brews artesanales y recetas virales de internet. Busca, calcula ratios y guarda tus favoritas en tu sesión.
        </p>

        {/* Predictive Search Engine */}
        <div className="mb-10">
          <PredictiveSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectRecipe={onSelectRecipe}
            allRecipes={allRecipes}
          />
        </div>

        {/* Live Encyclopedia Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-stone-800/60 text-stone-400 text-xs">
          <div className="flex items-center justify-center gap-2 py-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-200">{totalRecipes}+</span>
            <span>Recetas Web</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
            <Coffee className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-200">5</span>
            <span>Secciones Clave</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-200">Ratios</span>
            <span>Estándares SCA</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 bg-stone-900/40 rounded-xl border border-stone-800/40">
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-200">Sesión</span>
            <span>Guardado Personal</span>
          </div>
        </div>

      </div>
    </section>
  );
};

