import React, { useState, useMemo } from 'react';
import { CATEGORIES, RECIPES_DATA } from './data/recipesData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SectionMenu } from './components/SectionMenu';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AuthModal } from './components/AuthModal';
import { SubmitRecipeModal } from './components/SubmitRecipeModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { Coffee, Search, Bookmark, PlusCircle, RotateCcw } from 'lucide-react';

function EncyclopediaContent() {
  const { favorites, customRecipes, user } = useAuth();

  // Combine standard and user-submitted recipes
  const allRecipes = useMemo(() => {
    return [...customRecipes, ...RECIPES_DATA];
  }, [customRecipes]);

  // Main state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [difficultyFilter, setDifficultyFilter] = useState('todos');
  const [timeFilter, setTimeFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('destacados');

  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { todos: allRecipes.length };
    allRecipes.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [allRecipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    return allRecipes
      .filter((recipe) => {
        // Category filter
        if (activeCategory === 'favoritos') {
          if (!favorites.includes(recipe.id)) return false;
        } else if (activeCategory !== 'todos' && recipe.category !== activeCategory) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = recipe.name.toLowerCase().includes(q);
          const matchesDesc = recipe.shortDesc.toLowerCase().includes(q) || recipe.longDesc.toLowerCase().includes(q);
          const matchesTags = recipe.tags.some((t) => t.toLowerCase().includes(q));
          const matchesOrigin = recipe.origin.toLowerCase().includes(q);
          const matchesIng = recipe.ingredients.some((ing) => ing.item.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesTags && !matchesOrigin && !matchesIng) {
            return false;
          }
        }

        // Difficulty filter
        if (difficultyFilter !== 'todos' && recipe.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
          return false;
        }

        // Time filter
        if (timeFilter === 'rapido' && recipe.timeMinutes > 3) return false;
        if (timeFilter === 'medio' && (recipe.timeMinutes <= 3 || recipe.timeMinutes > 10)) return false;
        if (timeFilter === 'lento' && recipe.timeMinutes <= 10) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rapidos') {
          return a.timeMinutes - b.timeMinutes;
        }
        if (sortBy === 'nombre') {
          return a.name.localeCompare(b.name);
        }
        // Default: featured order
        return 0;
      });
  }, [allRecipes, activeCategory, favorites, searchQuery, difficultyFilter, timeFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('todos');
    setDifficultyFilter('todos');
    setTimeFilter('todos');
    setSortBy('destacados');
  };

  return (
    <div class="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      
      {/* Top Navbar with Session info & action pills */}
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onGoToFavorites={() => setActiveCategory('favoritos')}
        favoritesCount={favorites.length}
      />

      {/* Hero with Centered Predictive Search Bar */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
        allRecipes={allRecipes}
        totalRecipes={allRecipes.length}
      />

      {/* Main Encyclopedia Catalog Area */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Sections & Filters Bar */}
        <SectionMenu
          activeCategory={activeCategory}
          onSelectCategory={(catId) => setActiveCategory(catId)}
          categories={CATEGORIES}
          categoryCounts={categoryCounts}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          favoritesCount={favorites.length}
        />

        {/* Current View Title & Results Count */}
        <div class="flex items-center justify-between mb-6 pb-2">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              {activeCategory === 'favoritos' ? (
                <>
                  <Bookmark class="w-6 h-6 text-rose-500 fill-rose-500/20" />
                  <span>Mis Recetas Guardadas</span>
                </>
              ) : searchQuery ? (
                <>
                  <Search class="w-5 h-5 text-amber-500" />
                  <span>Resultados para "{searchQuery}"</span>
                </>
              ) : (
                <span>
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Catálogo de Recetas'}
                </span>
              )}
            </h2>
            <p class="text-xs text-stone-400 mt-1">
              Mostrando {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'} encontradas
            </p>
          </div>

          {(searchQuery || difficultyFilter !== 'todos' || timeFilter !== 'todos') && (
            <button
              onClick={handleClearFilters}
              class="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg text-xs border border-stone-800 transition-colors"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length > 0 ? (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelectRecipe={(r) => setSelectedRecipe(r)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div class="text-center py-20 px-4 bg-stone-900/40 border border-stone-800/60 rounded-3xl my-6">
            <div class="p-4 bg-stone-800/80 rounded-2xl w-fit mx-auto text-amber-400 mb-4">
              {activeCategory === 'favoritos' ? (
                <Bookmark class="w-10 h-10 text-stone-500" />
              ) : (
                <Coffee class="w-10 h-10 text-stone-500" />
              )}
            </div>

            {activeCategory === 'favoritos' ? (
              <div>
                <h3 class="text-xl font-bold text-white mb-2">No tienes recetas guardadas aún</h3>
                <p class="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mb-6">
                  {user
                    ? 'Explora las recetas de la enciclopedia y pulsa el corazón ❤️ para guardarlas en tu colección personal.'
                    : 'Inicia sesión para tener tu propia libreta de recetas favoritas de café.'}
                </p>
                <div class="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveCategory('todos')}
                    class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Explorar todas las recetas
                  </button>
                  {!user && (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      class="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 class="text-xl font-bold text-white mb-2">No se encontraron recetas</h3>
                <p class="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mb-6">
                  No encontramos coincidencias para los filtros aplicados. ¿Conoces esta receta y quieres aportarla a la enciclopedia?
                </p>
                <div class="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleClearFilters}
                    class="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Restablecer filtros de búsqueda
                  </button>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
                  >
                    <PlusCircle class="w-4 h-4" />
                    <span>Aportar esta receta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer onSelectCategory={(catId) => setActiveCategory(catId)} />

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Submit Recipe Modal */}
      <SubmitRecipeModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Global Toast Alerts */}
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EncyclopediaContent />
    </AuthProvider>
  );
}
