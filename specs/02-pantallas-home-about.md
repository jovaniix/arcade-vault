# Spec 02 — Pantallas Home y About

**Estado:** aprobado  
**Depende de:** Spec 01  
**Fecha:** 2026-10-24  
**Objetivo:** Implementar las pantallas Home y About (más sus rutas en el Nav) a partir de los templates `references/templates/home-about/`, integrándolas en la máquina de estados existente de `app/page.tsx`, y renombrar la ruta `biblioteca` a `games`.

---

## Alcance

### Dentro

- Renombrar la ruta `biblioteca` → `games` en `components/data.ts`, `components/Nav.tsx`, `components/Library.tsx` y `app/page.tsx`
- Añadir rutas `home` y `about` al tipo `Route` en `components/data.ts`
- Crear `components/Home.tsx` desde `home.jsx` (hero, feature-grid, mini-rail de juegos, stats, actividad en vivo, pricing, final CTA)
- Crear `components/About.tsx` desde `about.jsx` (misión, highlight-row, divider animado, formulario de contacto con estado `sent`)
- Actualizar `components/Nav.tsx`: logo navega a `home`; enlace Biblioteca apunta a `games`; añadir Inicio → `home` y Acerca de → `about`
- Actualizar `app/page.tsx`: ruta inicial `home`; renderizar `<Home>` y `<About>` según `route`
- Añadir a `app/globals.css` los bloques CSS de home y about desde `styles.css` (`.home`, `.home-hero`, `.home-silos`, `.home-section`, `.feature-grid`, `.feature-card`, `.mini-rail`, `.mini-card`, `.home-stats`, `.home-final`, `.reveal`, `.about`, `.about-hero`, `.highlight-row`, `.highlight`, `.about-divider`, `.about-contact`, `.contact-grid`, `.contact-form`, `.terminal-success`, y clases auxiliares relacionadas)

### Fuera

- Implementar envío real del formulario de contacto (sigue siendo solo estado local)
- Añadir backend o nueva persistencia
- Cambiar el sistema visual respecto a los templates de referencia
- Modificar la lógica interna de las pantallas ya implementadas (detalle, player, auth, salón)

---

## Modelo de datos

`components/data.ts` — tipo `Route` actualizado:

```ts
export type Route =
  | { name: "home" }           // nueva
  | { name: "games" }          // renombrada desde "biblioteca"
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" }
  | { name: "about" };         // nueva
```

No se introducen nuevas interfaces ni datos persistidos. El mini-rail de Home reutiliza el array `GAMES` existente. Los datos de actividad en vivo (últimas puntuaciones, top jugadores) son una constante hardcodeada en `Home.tsx`, igual que en el template.

---

## Plan de implementación

1. **`components/data.ts`** — cambiar `"biblioteca"` → `"games"` en el union `Route`; añadir `"home"` y `"about"`.

2. **`app/globals.css`** — copiar desde `references/templates/home-about/styles.css` los bloques de home y about (desde `.home { position: relative; }` hasta el final del archivo). No modificar bloques existentes.

3. **`components/Home.tsx`** — portar `home.jsx` a TSX:
   - Props: `{ navigate: (r: Route) => void; games: Game[] }`
   - `useReveal()` como hook local (`useEffect` + `IntersectionObserver`)
   - `FloatingSilhouettes`, `MiniCard`, `FeatureIcon` como sub-componentes internos (no exportados)
   - Mini-rail usa `games.slice(0, 6)`; botones EXPLORAR navegan a `{ name: "games" }`
   - Actividad en vivo: constante hardcodeada dentro del componente

4. **`components/About.tsx`** — portar `about.jsx` a TSX:
   - Props: `{ navigate: (r: Route) => void }`
   - Estado local tipado: `form: { name: string; email: string; msg: string }`, `sent: string | null`, `shake: boolean`
   - `HighlightIcon` como sub-componente interno (no exportado)
   - `onSubmit` solo actualiza `sent`; no hace fetch

5. **`components/Nav.tsx`** — actualizar:
   - `isActive` reconoce `"home"`, `"about"`, y `"games"` (esta última también activa cuando `route.name` es `"detalle"` o `"player"`)
   - Logo onClick → `{ name: "home" }`
   - Enlace Inicio → `{ name: "home" }`; Biblioteca → `{ name: "games" }`; Acerca de → `{ name: "about" }`
   - Panel móvil incluye los mismos cambios

6. **`app/page.tsx`** — actualizar:
   - Ruta inicial: `{ name: "home" }`
   - Parseo de hash: `"#games"` → `{ name: "games" }`; añadir `"#home"` y `"#about"`; mantener compatibilidad con `"#biblioteca"` redirigiendo a `games`
   - Ramas de renderizado para `"home"`, `"games"`, `"about"`

---

## Criterios de aceptación

- [ ] Al abrir la app en `/`, se muestra la pantalla Home
- [ ] El hero muestra el título en tres líneas con gradientes y las siluetas flotantes animadas
- [ ] Los botones "EXPLORAR JUEGOS" e "INSERTAR MONEDA" navegan a `games`; "CREAR CUENTA" navega a `auth`
- [ ] El mini-rail muestra 6 tarjetas; clic en una navega a `detalle` del juego correspondiente
- [ ] Las secciones Why, Stats, Actividad en vivo, Pricing y Final CTA se renderizan sin errores
- [ ] El logo del Nav navega a `home`; el enlace Biblioteca navega a `games`
- [ ] Los enlaces Inicio y Acerca de del Nav están presentes y se marcan activos correctamente
- [ ] Al navegar a Acerca de, se muestra la pantalla About con misión, highlights y formulario
- [ ] El formulario muestra el terminal de éxito al enviar con todos los campos completos
- [ ] El formulario ejecuta la animación de shake si se envía con campos vacíos
- [ ] La URL hash `#biblioteca` sigue funcionando (redirige a `games`)
- [ ] No hay errores de TypeScript (`tsc --noEmit` pasa sin errores)
- [ ] Las pantallas detalle, player, auth y salón siguen funcionando sin regresiones

---

## Decisiones tomadas

- **Renombrar `biblioteca` → `games`**: el profesor confirmó la preferencia por `/games`; es más consistente con una URL en inglés como el resto del stack.
- **Compatibilidad con hash `#biblioteca`**: se mantiene la redirección en el parseo de hash para no romper URLs existentes guardadas.
- **Ruta inicial cambia a `home`**: la app ahora tiene landing page real; arrancar en `games` ya no tiene sentido.
- **Actividad en vivo como constante hardcodeada**: el profesor confirmó que puede quedarse temporalmente así; no vale la pena abstraerla hasta que haya datos reales.
- **Sub-componentes internos**: `FloatingSilhouettes`, `MiniCard`, `FeatureIcon`, `HighlightIcon` se mantienen en su propio archivo de pantalla para no pre-exportar componentes que solo usa una pantalla.

---

## Riesgos

- **CSS acumulativo**: `globals.css` ya es grande; los bloques de home/about agregan ~220 líneas. Verificar que `.reveal` y `.field` (ya usado en auth) no colisionen.
- **Parseo de hash**: cualquier ruta nueva (`home`, `about`) debe registrarse en el `useEffect` de inicialización de `page.tsx`; si se omite, la URL directa no funcionará.
