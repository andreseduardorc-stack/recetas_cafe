import React, { useState } from 'react';
import { X, Lock, Mail, User, Coffee, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('Entusiasta');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (isRegisterMode) {
      if (!name) {
        setError('Por favor ingresa tu nombre.');
        return;
      }
      register({ name, email, password, level });
      onClose();
    } else {
      login(email, password);
      onClose();
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    onClose();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div class="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          class="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div class="text-center mb-6">
          <div class="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <Coffee class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">
            {isRegisterMode ? 'Crear tu Cuenta Barista' : 'Iniciar Sesión en CaféPedia'}
          </h2>
          <p class="text-xs text-stone-400 mt-1.5">
            {isRegisterMode
              ? 'Guarda tus recetas preferidas, ratios y notas de preparación.'
              : 'Accede a tu colección personal de recetas de café guardadas.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div class="flex p-1 bg-stone-950 rounded-xl mb-6 border border-stone-800">
          <button
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
            class={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegisterMode
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
            class={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegisterMode
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div class="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Nombre o Apodo</label>
              <div class="relative">
                <User class="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Barista"
                  class="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">Correo Electrónico</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                class="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-300 mb-1">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label class="block text-xs font-semibold text-stone-300 mb-1">Tu nivel con el café</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                class="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Aficionado">🌱 Aficionado curioso</option>
                <option value="Entusiasta">☕ Entusiasta del café de especialidad</option>
                <option value="Barista Pro">👨‍🍳 Barista Profesional / Tostador</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            class="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 text-sm"
          >
            <span>{isRegisterMode ? 'Crear Cuenta y Continuar' : 'Acceder a mi Cuenta'}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-stone-800"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-stone-900 px-3 text-stone-500 font-semibold">O para probar ya mismo</span>
          </div>
        </div>

        {/* 1-Click Demo Login */}
        <button
          onClick={handleDemo}
          class="w-full py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700/60 rounded-xl text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles class="w-4 h-4 text-amber-400" />
          <span>Entrar con Perfil Demo Barista (1 clic)</span>
        </button>

        <p class="text-[11px] text-stone-400 text-center mt-4">
          Tus favoritos y preferencias se sincronizan de forma local e inmediata.
        </p>
      </div>
    </div>
  );
};
