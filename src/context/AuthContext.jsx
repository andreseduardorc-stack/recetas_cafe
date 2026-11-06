import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'user_demo_1',
  name: 'Barista Aficionado',
  email: 'aficionado@cafepedia.com',
  level: 'Entusiasta del Café',
  avatar: '☕',
  joinedDate: 'Noviembre 2026',
  favorites: ['espresso-perfecto', 'flat-white', 'cold-brew-clasico', 'v60-kasuya-46'],
};

export const AuthProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cafepedia_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Favorites state (persisted)
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavs = localStorage.getItem('cafepedia_favorites');
      if (savedFavs) return JSON.parse(savedFavs);
      return ['espresso-perfecto', 'v60-kasuya-46'];
    } catch {
      return ['espresso-perfecto'];
    }
  });

  // User-submitted community recipes
  const [customRecipes, setCustomRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem('cafepedia_custom_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync active user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('cafepedia_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cafepedia_active_user');
    }
  }, [user]);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('cafepedia_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync custom recipes
  useEffect(() => {
    localStorage.setItem('cafepedia_custom_recipes', JSON.stringify(customRecipes));
  }, [customRecipes]);

  // Login handler
  const login = (email, _password) => {
    // Demo / mock authentication with local accounts
    const existingUsers = JSON.parse(localStorage.getItem('cafepedia_users') || '[]');
    const found = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    const loggedUser = found || {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email,
      level: 'Amante del Café',
      avatar: '☕',
      joinedDate: 'Hoy',
    };

    setUser(loggedUser);
    showToast(`¡Bienvenido de vuelta, ${loggedUser.name}!`, 'success');
    return true;
  };

  // Quick 1-click Demo Login
  const loginAsDemo = () => {
    setUser(DEFAULT_USER);
    setFavorites(prev => Array.from(new Set([...prev, ...DEFAULT_USER.favorites])));
    showToast('Sesión iniciada con Perfil Demo Barista ☕', 'success');
  };

  // Register handler
  const register = ({ name, email, _password, level }) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim() || 'Barista Nuevo',
      email: email.trim(),
      level: level || 'Aficionado',
      avatar: level === 'Barista Pro' ? '👨‍🍳' : '☕',
      joinedDate: 'Noviembre 2026',
    };

    const existingUsers = JSON.parse(localStorage.getItem('cafepedia_users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('cafepedia_users', JSON.stringify(existingUsers));

    setUser(newUser);
    showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.name}.`, 'success');
    return true;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    showToast('Has cerrado sesión correctamente.', 'info');
  };

  // Toggle favorite
  const toggleFavorite = (recipeId) => {
    if (!user) {
      // Prompt user that saving requires an active session
      showToast('Inicia sesión para guardar recetas en tus favoritos 🔒', 'warning');
      return false; // indicates modal should open
    }

    setFavorites(prev => {
      const exists = prev.includes(recipeId);
      if (exists) {
        showToast('Receta removida de tus favoritos', 'info');
        return prev.filter(id => id !== recipeId);
      } else {
        showToast('¡Receta guardada en tus favoritos! ❤️', 'success');
        return [...prev, recipeId];
      }
    });
    return true;
  };

  const isFavorite = (recipeId) => favorites.includes(recipeId);

  // Add custom community recipe
  const addCustomRecipe = (recipe) => {
    const formattedRecipe = {
      ...recipe,
      id: 'custom-' + Date.now(),
      source: user ? `Aportado por ${user.name}` : 'Aportado por usuario',
      rating: 5.0,
      image: recipe.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    };

    setCustomRecipes(prev => [formattedRecipe, ...prev]);
    showToast('¡Receta publicada con éxito en CaféPedia! 🎉', 'success');
    return formattedRecipe;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        favorites,
        customRecipes,
        toast,
        login,
        loginAsDemo,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        addCustomRecipe,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
