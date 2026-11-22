# ☕ CaféPedia — Enciclopedia de Recetas de Café

**CaféPedia** reúne recetas de café con su ficha de barista completa: desde los métodos de
extracción manual y los clásicos de cafetería hasta preparaciones tradicionales del mundo,
alternativas sin cafeína y alguna bebida de autor.

Cada receta declara su **proporción, molienda, temperatura y tiempo**, además de ingredientes
escalables y pasos numerados. Eso es lo que la distingue de un listado de enlaces.

**Publicada en GitHub Pages**, servida desde la carpeta `docs/`.

---

## 📊 Estado

| | |
|---|---|
| Recetas publicadas | **27** |
| Recetas en el pool, esperando turno | **25** |
| Ritmo de publicación | 1 por semana, automática |
| Pruebas | 46, con `node:test` (sin framework) |

Reparto actual de lo publicado: 10 especiales, 5 filtrados, 5 fríos, 4 clásicos y 3 alternativas.
El pool corrige ese sesgo: cuando termine de publicarse, serán 12 clásicos, 11 filtrados,
10 fríos, 12 especiales y 7 alternativas.

---

## 🤖 El bot curador

Un flujo de GitHub Actions (`.github/workflows/auto_curator.yml`) publica **una receta nueva cada
lunes** sin intervención manual. También se puede lanzar a mano desde la pestaña *Actions*, o en
local con `npm run curate`.

```
cron lunes 09:00 UTC ──► npm test ──► npm run curate ──► npm run build ──► git push
                         (el guarda)  (elige y escribe)  (recompila docs/)
```

> [!IMPORTANT]
> **El bot no rastrea internet.** Publica desde `scripts/discovery_pool.js`, un catálogo de
> recetas escritas y verificadas a mano. Es una decisión deliberada, no una limitación temporal:
> la mitad de los campos de una ficha —proporción, molienda, temperatura, notas de cata, origen,
> dificultad, consejo de barista— no existen en ninguna fuente legible por máquina. El vocabulario
> estándar de recetas (`schema.org/Recipe`) llega hasta ingredientes, pasos y tiempos, y ahí se
> acaba. Lo demás es criterio editorial, y rellenarlo automáticamente exigiría un modelo de
> lenguaje.

Qué hace en cada ejecución:

1. **Valida lo ya publicado.** Si el esquema rechaza una receta que ya está en la web, el fallo
   está en el esquema y el bot aborta **sin escribir nada**.
2. **Descarta las ya publicadas** del pool, comparando por `id` y por nombre normalizado.
3. **Valida cada candidata** y se queda con la primera que pasa. Las que caen se registran en el
   log con el campo y el motivo, y el bot sigue con la siguiente en vez de rendirse.
4. **Inserta, recompila y publica.**

Si el pool se vacía, el bot imprime «¡Al día!» y **sale con código 0**: Actions se pone en verde.
Conviene saberlo, porque es la única forma de que deje de publicar sin que nadie se entere.

---

## ✅ Validación y pruebas

```bash
npm test     # 46 comprobaciones
```

`scripts/recipe_schema.js` valida la **forma** de una receta en tres niveles:

| Nivel | Campos | Qué pasa si falta |
|---|---|---|
| 1 | `name`, `tags`, `difficulty`, `categoryName`, `origin`, `flavorNotes` | **La web no carga**: el índice de búsqueda se construye al importar el módulo de datos |
| 1 | `id`, `ingredients` | El `id` identifica la receta; sin `ingredients` bien formados, la búsqueda revienta al teclear |
| 2 | `category`, `timeMinutes`, `steps`, `ratio`, `grindSize`, `temp`, `time`, `shortDesc`, `longDesc`, `baristaTip`, `source`, `image` | La ficha se ve a medias |
| 3 | `coffeeGrams`, `waterMl`, `milkMl` | Nada: ningún componente los lee |

Las pruebas del pool vigilan además las formas de que una receta quede **muerta** —escrita, válida
y aun así descartada en cada ejecución—: llevar el nombre de otra ya publicada, repetir `id` o
nombre dentro del pool, o reutilizar un `id` publicado con otra receta detrás.

---

## 🌟 Qué trae la web

**Buscador predictivo.** Sugiere nombres, métodos e ingredientes mientras escribes, con navegación
por teclado (`↑` `↓`, `Enter` para abrir, `Esc` para cerrar) y resaltado de coincidencias. Debajo,
seis píldoras de búsqueda rápida: Espresso, Fríos & Cold Brew, V60 Pour Over, Con Leche, Rápidos
(<3 min) y Especiales de Autor.

**Cinco secciones**, con filtro por dificultad y tiempo, y tres ordenaciones: recomendados, más
rápidos primero y alfabético.

| Sección | Qué agrupa |
|---|---|
| Clásicos de Cafetería | Espresso, cortado, americano, latte, macchiato, ristretto, lungo, mocha… |
| Filtrados y Cafeteras Manuales | V60, Chemex, prensa francesa, AeroPress, moka, Kalita, sifón, Clever, Melitta, cuccumella, percoladora |
| Cafés Fríos & Iced | Cold brew, espresso tonic, affogato, shakerato, flash brew japonés, cà phê sữa đá, frappé griego, mazagran |
| Especiales & De Autor | Irish coffee, café de olla, dalgona, café turco, touba, barraquito, yuenyeung, qahwa, espresso martini |
| Salud & Alternativos | Bulletproof, matcha espresso, kaffeost, cascara, achicoria, orzo, diente de león |

> La sección de filtrados **no se llama «Pour Over»** a propósito: el sifón, la percoladora y la
> cuccumella no lo son.

**Ficha de barista** con calculadora de proporciones (escala los ingredientes a 1, 2, 3 o 4 tazas),
cronómetro con inicio, pausa y reinicio, pasos marcables y consejo de barista.

**Sesión y favoritos** en `localStorage`, con acceso rápido de demostración en un clic y una
sección «Mis Guardados».

**Formulario de aporte** para que una persona con sesión añada su propia receta. Vive solo en su
navegador: no llega al repositorio.

---

## 🚀 Ejecutar en local

```bash
npm install
npm run dev       # http://localhost:5173/recetas_cafe/
npm run build     # compila y copia a docs/
npm run preview   # sirve lo compilado
npm run lint      # oxlint
```

> [!NOTE]
> `npm run lint` saca unos 950 avisos de `docs/assets/*.js`. Son del bundle compilado, que se
> versiona para GitHub Pages. El código fuente sale limpio.

---

## 📁 Estructura

```
src/
  data/recipesData.js      Las recetas PUBLICADAS: es lo que ve la web
  components/              Buscador, tarjetas, ficha, formularios
scripts/
  auto_curator.js          El bot: elige, inserta, recompila
  discovery_pool.js        El catálogo de candidatas (solo datos)
  recipe_schema.js         El validador de forma
  curator_select.js        Elige la primera válida y explica los descartes
  *.test.js                Las pruebas
docs/                      Salida de vite build. NO es documentación.
specs/                     Diseño y plan de los cambios grandes
```

---

## 🛠️ Stack

- **Frontend**: React 19 + Vite 8
- **Estilos**: Tailwind CSS v4, paleta de ámbar, piedra y crema
- **Iconos**: Lucide React
- **Tipografías**: Playfair Display y Plus Jakarta Sans, desde Google Fonts
- **Almacenamiento**: `localStorage`, sin servidor ni base de datos
- **Pruebas**: `node:test`, el de la biblioteca estándar de Node. Sin dependencias.

## 📌 Una nota sobre las recetas

Las proporciones son las que se publican habitualmente para cada método, y el campo `source` cita
la referencia cuando existe. Donde se cita a la **SCA** es porque esa receta concreta sigue su
estándar; no todo el catálogo lo hace, y no podría: un cóctel o una infusión de cáscara de café no
tienen ratio de extracción.

Las imágenes son enlaces a Unsplash.
