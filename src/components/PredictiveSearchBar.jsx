import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Coffee, Flame, ArrowRight } from 'lucide-react';

export const PredictiveSearchBar = ({ searchQuery, setSearchQuery, onSelectRecipe, allRecipes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const POPULAR_TAGS = [
    { label: '⚡ Espresso', query: 'espresso' },
    { label: '🧊 Fríos & Cold Brew', query: 'cold brew' },
    { label: '💧 V60 Pour Over', query: 'v60' },
    { label: '🥛 Con Leche', query: 'leche' },
    { label: '⏱️ Rápidos (<3 min)', query: 'rapido' },
    { label: '✨ Especiales de Autor', query: 'especial' },
  ];

  // Derive predictive suggestions directly from query and allRecipes (no setState-in-effect)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { recipes: [], tags: [], methods: [] };
    }

    // Match recipe titles and contents
    const matchedRecipes = allRecipes
      .filter((r) => 
        r.name.toLowerCase().includes(q) || 
        r.shortDesc.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);

    // Match brewing methods
    const allMethods = ['V60', 'Chemex', 'Prensa Francesa', 'AeroPress', 'Moka Italiana', 'Espresso', 'Cold Brew', 'Cezve Turco'];
    const matchedMethods = allMethods.filter((m) => m.toLowerCase().includes(q)).slice(0, 3);

    // Match common ingredients
    const commonIngredients = ['leche', 'canela', 'vainilla', 'whiskey', 'hielo', 'chocolate', 'piloncillo', 'matcha', 'mct', 'crema'];
    const matchedTags = commonIngredients
      .filter((t) => t.includes(q) && !matchedRecipes.some((r) => r.name.toLowerCase().includes(t)))
      .slice(0, 3);

    return {
      recipes: matchedRecipes,
      methods: matchedMethods,
      tags: matchedTags
    };
  }, [searchQuery, allRecipes]);

  const hasSuggestions = suggestions.recipes.length > 0 || suggestions.methods.length > 0 || suggestions.tags.length > 0;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalSuggestions = suggestions.recipes.length + suggestions.methods.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalSuggestions - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.recipes.length) {
        const selected = suggestions.recipes[selectedIndex];
        onSelectRecipe(selected);
        setIsOpen(false);
      } else if (selectedIndex >= suggestions.recipes.length) {
        const methodIndex = selectedIndex - suggestions.recipes.length;
        const method = suggestions.methods[methodIndex];
        setSearchQuery(method);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight matching text helper
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} class="bg-amber-500/20 text-amber-300 font-bold px-0.5 rounded">{part}</span>
      ) : part
    );
  };

  const showDropdown = isOpen && hasSuggestions && searchQuery.trim().length > 0;

  return (
    <div ref={wrapperRef} class="relative w-full max-w-3xl mx-auto z-40">
      {/* Search Input Box */}
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-400 transition-colors">
          <Search class="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (searchQuery.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Busca cualquier receta, método (V60, Cold Brew) o ingrediente..."
          class="w-full pl-12 sm:pl-14 pr-12 py-4 sm:py-5 bg-stone-900/90 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 focus:border-amber-500/80 rounded-2xl text-stone-100 placeholder-stone-400 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-2xl backdrop-blur-md transition-all duration-200"
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X class="w-5 h-5 bg-stone-800 hover:bg-stone-700 rounded-full p-1" />
          </button>
        )}
      </div>

      {/* Autocomplete Predictive Dropdown Menu */}
      {showDropdown && (
        <div class="absolute left-0 right-0 mt-2 bg-stone-900/95 border border-stone-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-stone-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Section: Recipe Direct Matches */}
          {suggestions.recipes.length > 0 && (
            <div class="p-2 sm:p-3">
              <div class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                <Coffee class="w-3.5 h-3.5" />
                Recetas Coincidentes
              </div>
              <div class="mt-1 space-y-1">
                {suggestions.recipes.map((recipe, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        onSelectRecipe(recipe);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      class={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected ? 'bg-amber-500/20 text-white' : 'hover:bg-stone-800/80 text-stone-200'
                      }`}
                    >
                      <div class="flex items-center gap-3">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          class="w-10 h-10 rounded-lg object-cover border border-stone-700/60"
                        />
                        <div>
                          <div class="text-sm font-semibold text-stone-100">
                            {highlightMatch(recipe.name, searchQuery)}
                          </div>
                          <div class="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                            <span class="text-amber-400/90">{recipe.categoryName}</span>
                            <span>•</span>
                            <span>{recipe.time}</span>
                            <span>•</span>
                            <span>{recipe.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight class={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-amber-400' : 'text-stone-500'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Brewing Methods & Ingredients */}
          {(suggestions.methods.length > 0 || suggestions.tags.length > 0) && (
            <div class="p-2 sm:p-3 bg-stone-950/40">
              <div class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
                <Flame class="w-3.5 h-3.5 text-amber-500" />
                Métodos & Ingredientes Detectados
              </div>
              <div class="flex flex-wrap gap-2 px-2 py-1 mt-1">
                {suggestions.methods.map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setSearchQuery(method);
                      setIsOpen(false);
                    }}
                    class="px-3 py-1.5 bg-stone-800 hover:bg-amber-600/30 hover:border-amber-500/50 border border-stone-700/60 rounded-lg text-xs font-medium text-stone-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>☕ Método:</span>
                    <span class="text-amber-300 font-semibold">{highlightMatch(method, searchQuery)}</span>
                  </button>
                ))}
                {suggestions.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsOpen(false);
                    }}
                    class="px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700 border border-stone-700/50 rounded-lg text-xs text-stone-300 transition-colors flex items-center gap-1"
                  >
                    <span>#</span>
                    <span>{highlightMatch(tag, searchQuery)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer instruction */}
          <div class="px-4 py-2 bg-stone-950 text-[11px] text-stone-500 flex items-center justify-between">
            <span class="hidden sm:inline">Navega con flechas ↑ ↓ y presiona Enter para abrir</span>
            <span class="text-amber-500/80 font-medium">Búsqueda predictiva activa</span>
          </div>
        </div>
      )}

      {/* Quick Suggestion Pills */}
      <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span class="text-stone-400 font-medium whitespace-nowrap pl-1">Explora rápido:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag.query}
            onClick={() => setSearchQuery(tag.query)}
            class={`px-3 py-1.5 rounded-full whitespace-nowrap border transition-all duration-150 ${
              searchQuery.toLowerCase() === tag.query.toLowerCase()
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-sm'
                : 'bg-stone-900/60 hover:bg-stone-800 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};
