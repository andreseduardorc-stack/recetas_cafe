# ☕ CaféPedia — La Gran Enciclopedia Universal de Recetas de Café

**CaféPedia** es una plataforma moderna diseñada para recopilar, clasificar y preservar recetas de café de todo internet: desde los métodos de extracción clásicos de cafetería y filtrados manuales SCA (Specialty Coffee Association), hasta preparaciones frías de autor y bebidas virales de la red.

---

## 🌟 Características Principales del Borrador (MVP 1.0)

1. **Buscador Predictivo Inteligente (Autocomplete & Live Filter)**:
   - Sugiere palabras clave, nombres de recetas, métodos de extracción (V60, Chemex, Cold Brew) e ingredientes (leche, canela, matcha, whiskey) en tiempo real mientras escribes.
   - Navegación ágil mediante teclado (flechas `↑` y `↓`, `Enter` para abrir y `Esc` para cerrar).
   - Resaltado visual en tiempo real de los términos coincidentes.
   - Píldoras de búsqueda rápida de un toque (`#Espresso`, `#ColdBrew`, `#Fácil`, `#ConLeche`, etc.).

2. **Menú de Secciones y Filtros Barista**:
   - **Clásicos de Cafetería**: Espresso Doble, Flat White Australiano, Cappuccino Italiano, Café Bombón, etc.
   - **Filtrados Manuales (Pour Over / Inmersión)**: Hario V60 (Método 4:6 de Tetsu Kasuya), Chemex Golden Cup, Prensa Francesa (Método Supremo James Hoffmann), AeroPress Invertida de Campeonato, Moka Italiana Bialetti.
   - **Cafés Fríos & Iced**: Cold Brew Artesanal (Maceración 18h), Espresso Tonic con Romero, Affogato al Caffè, Iced Vanilla Oat Latte, Caffè Shakerato Romano.
   - **Especiales & De Autor**: Irish Coffee Foynes 1943, Pumpkin Spice Latte casero, Café de Olla Tradicional Mexicano, Dalgona Coffee Coreano, Café Turco en Cezve (UNESCO), Dirty Chai Latte.
   - **Salud & Alternativos**: Bulletproof Keto Coffee con Ghee/MCT, Iced Matcha Espresso Fusion tricolor.
   - Filtros secundarios por nivel de dificultad (*Fácil*, *Intermedio*, *Avanzado*), tiempo de preparación y ordenación (*Recomendados*, *Más Rápidos*, *Alfabético*).

3. **Sistema de Sesión y Guardado de Favoritos**:
   - Modal interactivo de **Inicio de Sesión y Registro** con selección de perfil barista (*Aficionado*, *Entusiasta*, *Barista Profesional*).
   - Botón de **Acceso Rápido Demo (1 clic)** para probar instantáneamente sin rellenar formularios.
   - Persistencia local en `localStorage` de la sesión del usuario y de sus recetas favoritas marcadas con el corazón ❤️.
   - Sección dedicada **"Mis Guardados"** accesible directamente desde la barra superior.
   - Notificaciones flotantes tipo Toast para confirmar acciones de guardado y sesión.

4. **Ficha Técnica Barista Interactiva**:
   - Especificaciones estándar SCA: Ratio café/agua, tipo de molienda recomendada, temperatura del agua y perfil de notas de cata.
   - **Calculadora Dinámica de Proporciones**: Escala automáticamente los gramos de café y mililitros de agua según la cantidad de tazas deseadas (1x, 2x, 3x, 4x).
   - **Cronómetro Barista Integrado**: Cronómetro digital incorporado con Inicio, Pausa y Reinicio para controlar los tiempos exactos de pre-infusión (*bloom*) y extracción.
   - Lista interactiva de pasos con casillas para marcar el progreso paso a paso.
   - Consejos y secretos profesionales del barista para evitar subextracción o sobreextracción.

5. **Aporte de Recetas de Internet**:
   - Formulario para que los usuarios registrados puedan ingresar nuevas recetas encontradas en la web con enlace a la fuente original, ingredientes dinámicos y pasos personalizados.

---

## 🚀 Cómo Ejecutar el Proyecto en Local

### 1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173` para disfrutar de la experiencia interactiva.

### 2. Generar compilación optimizada para producción:
```bash
npm run build
npm run preview
```

---

## 🛠️ Stack Tecnológico
- **Frontend**: React 19 + Vite 8
- **Estilos**: Tailwind CSS v4 (Paleta barista con tonos ámbar, obsidiana y crema)
- **Iconografía**: Lucide React
- **Tipografías**: Google Fonts (*Playfair Display* & *Plus Jakarta Sans*)
- **Almacenamiento**: Persistencia reactiva en `localStorage` con arquitectura extensible a Firebase / Supabase.
# recetas_cafe
