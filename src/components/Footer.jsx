import React from 'react';
import { Coffee, Sparkles } from 'lucide-react';

export const Footer = ({ onSelectCategory }) => {
  return (
    <footer class="mt-20 border-t border-stone-800/80 bg-stone-950 text-stone-400 text-xs">
      {/* Coffee Knowledge Strip */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-stone-800/60">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-stone-900/40 p-4 rounded-2xl border border-stone-800/60">
            <h4 class="font-bold text-amber-400 flex items-center gap-2 mb-2 text-sm">
              <Sparkles class="w-4 h-4" /> ¿Qué es el Ratio Café-Agua?
            </h4>
            <p class="text-stone-300 leading-relaxed text-xs">
              La proporción matemática entre café molido y agua de extracción. Un ratio 1:15 significa 1 gramo de café por cada 15 gramos de agua, el estándar de oro para filtrados manuales.
            </p>
          </div>

          <div class="bg-stone-900/40 p-4 rounded-2xl border border-stone-800/60">
            <h4 class="font-bold text-amber-400 flex items-center gap-2 mb-2 text-sm">
              <Sparkles class="w-4 h-4" /> La Mágica Pre-infusión (Bloom)
            </h4>
            <p class="text-stone-300 leading-relaxed text-xs">
              Los primeros 30-45 segundos donde el café recién molido se moja con el doble de su peso en agua para liberar dióxido de carbono atrapado, permitiendo una extracción dulce y uniforme.
            </p>
          </div>

          <div class="bg-stone-900/40 p-4 rounded-2xl border border-stone-800/60">
            <h4 class="font-bold text-amber-400 flex items-center gap-2 mb-2 text-sm">
              <Sparkles class="w-4 h-4" /> Regla de la Microespuma
            </h4>
            <p class="text-stone-300 leading-relaxed text-xs">
              Para bebidas de leche sedosas (Flat White, Latte), vaporiza la leche manteniendo el remolino sin sobrepasar los 65°C, logrando una textura de pintura brillante sin burbujas visibles.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-600/20 text-amber-500 rounded-xl">
            <Coffee class="w-5 h-5" />
          </div>
          <div>
            <span class="font-bold text-stone-200 text-sm font-serif">CaféPedia</span> — La Enciclopedia de Recetas de Café
            <p class="text-[11px] text-stone-400">Recopilando el conocimiento de baristas de todo internet.</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs text-stone-400">
          <button onClick={() => onSelectCategory('clasicos')} class="hover:text-amber-400 transition-colors">
            Clásicos
          </button>
          <span>•</span>
          <button onClick={() => onSelectCategory('filtrados')} class="hover:text-amber-400 transition-colors">
            Filtrados
          </button>
          <span>•</span>
          <button onClick={() => onSelectCategory('frios')} class="hover:text-amber-400 transition-colors">
            Fríos & Cold Brew
          </button>
          <span>•</span>
          <button onClick={() => onSelectCategory('especiales')} class="hover:text-amber-400 transition-colors">
            Especiales
          </button>
        </div>

        <div class="text-[11px] text-stone-400 text-center sm:text-right">
          Borrador MVP 1.0 • Diseñado para amantes del café
        </div>
      </div>
    </footer>
  );
};
