import React, { useState } from 'react';
import { Coffee, Heart, PlusCircle, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenAuthModal, onOpenSubmitModal, onGoToFavorites, favoritesCount }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <nav class="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-xl border-b border-stone-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" class="flex items-center gap-3 group">
          <div class="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 rounded-2xl shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform duration-200">
            <Coffee class="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-serif">
                Café<span class="text-amber-500">Pedia</span>
              </span>
              <span class="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                Wiki 1.0
              </span>
            </div>
            <p class="text-[11px] text-stone-400 hidden sm:block tracking-wide">
              La Gran Enciclopedia Universal del Café
            </p>
          </div>
        </a>

        {/* Action Buttons & Session */}
        <div class="flex items-center gap-2 sm:gap-3">
          
          {/* Submit recipe button */}
          <button
            onClick={onOpenSubmitModal}
            class="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700 text-xs font-semibold transition-all"
          >
            <PlusCircle class="w-4 h-4 text-amber-400" />
            <span>Aportar Receta</span>
          </button>

          {/* Quick Favorites Button */}
          <button
            onClick={onGoToFavorites}
            class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-800 hover:border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Heart class="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span class="hidden sm:inline">Guardados</span>
            <span class="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold">
              {favoritesCount}
            </span>
          </button>

          {/* User Session Profile Badge */}
          {user ? (
            <div class="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-stone-900 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-500/60 rounded-xl transition-all"
              >
                <div class="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-sm">
                  {user.avatar || '☕'}
                </div>
                <div class="hidden sm:block text-left text-xs leading-tight">
                  <div class="font-bold text-stone-100 truncate max-w-[110px]">{user.name}</div>
                  <div class="text-[10px] text-amber-400">{user.level || 'Barista'}</div>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-stone-400 ml-0.5" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div class="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div class="p-3 border-b border-stone-800/80 mb-1">
                    <div class="font-bold text-white">{user.name}</div>
                    <div class="text-[11px] text-stone-400 truncate">{user.email}</div>
                    <span class="inline-block mt-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                      {user.level || 'Entusiasta'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onGoToFavorites();
                    }}
                    class="w-full flex items-center gap-2 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl transition-colors text-left"
                  >
                    <Heart class="w-4 h-4 text-rose-400" />
                    <span>Mis Recetas Favoritas ({favoritesCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSubmitModal();
                    }}
                    class="w-full flex items-center gap-2 px-3 py-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl transition-colors text-left"
                  >
                    <PlusCircle class="w-4 h-4 text-amber-400" />
                    <span>Aportar una Receta Web</span>
                  </button>

                  <div class="border-t border-stone-800/80 my-1" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    class="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut class="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              class="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-600/30 transition-all transform active:scale-95"
            >
              <User class="w-4 h-4" />
              <span>Crear Sesión / Login</span>
            </button>
          )}

        </div>

      </div>
    </nav>
  );
};
