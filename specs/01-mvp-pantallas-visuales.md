# Spec 01 — MVP Pantallas Visuales

**Estado:** Implementado 
**Depende de:** —  
**Fecha:** 2026-10-19  
**Objetivo:** Portar las 5 pantallas de los templates de referencia (Biblioteca, Detalle, Reproductor, Auth, Salón) al stack Next.js/TypeScript, con navegación funcional y todo el sistema visual, sin implementar ningún juego real.

---

## Alcance

### Dentro

- Convertir cada template `.jsx` en un componente `.tsx` con tipos TypeScript
- Crear `components/data.ts` con los tipos `Route`, `User`, `Game`, `ScoreRow`, el array `GAMES`, `CATS` y la función `seededScores()`
- Reemplazar `app/page.tsx` (boilerplate Next.js) con la lógica de `app.jsx`: máquina de estados `route`, persistencia de `user` en `localStorage`, `av_scores` en `localStorage`, serialización del hash
- Incluir los divs de fondo (`.av-bg`, `.av-noise`) en el layout o en la página principal
- Mantener exactamente los estilos ya definidos en `app/globals.css` — no se agrega CSS nuevo
- El reproductor (`GamePlayer`) conserva la animación de puntuación auto-incremental y el modal de fin de juego, pero la "arena CRT" es puramente decorativa (CSS, sin lógica de juego)

### Fuera

- Implementar ningún juego jugable real
- Backend, API o autenticación real (sigue siendo localStorage)
- Nuevas pantallas o rutas no presentes en los templates
- Modificar el diseño visual respecto a los templates de referencia

---

## Modelo de datos

Vive en `components/data.ts`:

```ts
export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export interface User { name: string; }

export interface Game {
  id: string; title: string; short: string; long: string;
  cat: string; cover: string; color: string; best: number; plays: string;
}

export interface ScoreRow {
  rank: number; name: string; score: number; date: string;
}
```

`GAMES` (8 juegos), `CATS`, `seededScores()` son port directo de `data.jsx` sin cambios de lógica.

---

## Plan de implementación

1. **`components/data.ts`** — copiar GAMES, CATS, seededScores y añadir los tipos exportados.
2. **`components/Nav.tsx`** — port de `nav.jsx`; recibe `{ route, navigate, user, onSignOut }`.
3. **`components/Library.tsx`** — port de `biblioteca.jsx`; recibe `{ navigate }`.
4. **`components/GameDetail.tsx`** — port de `detalle.jsx`; recibe `{ id, navigate }`.
5. **`components/GamePlayer.tsx`** — port de `reproductor.jsx`; recibe `{ id, user, navigate, onSaveScore }`.
6. **`components/Auth.tsx`** — port de `auth.jsx`; recibe `{ navigate, onLogin }`.
7. **`components/HallOfFame.tsx`** — port de `salon.jsx`; recibe `{ user, navigate }`.
8. **`app/page.tsx`** — reemplazar boilerplate con la lógica de `app.jsx`: estado `route` + `user`, efectos de hash y scroll, `handleLogin`, `handleSignOut`, `handleSaveScore`, render condicional de pantallas. Añadir `<div className="av-bg" />` y `<div className="av-noise" />` antes del `<Nav>`. El componente lleva `"use client"`.
9. **`app/globals.css`** — verificar que incluya todos los estilos de `styles.css` del template; completar si falta alguna sección (específicamente los estilos de la arena CRT y el modal de game-over si aún no están).

Cada paso deja la app compila­ble. El orden garantiza que ningún componente se importa antes de existir.

---

## Criterios de aceptación

- [ ] `next dev` arranca sin errores de compilación TypeScript
- [ ] La ruta inicial muestra la pantalla **Biblioteca** con la grilla de 8 juegos
- [ ] Los chips de categoría filtran la grilla correctamente
- [ ] El buscador filtra por nombre en tiempo real
- [ ] Clic en una card o en "JUGAR" navega a **Detalle** del juego correcto
- [ ] Detalle muestra el leaderboard generado por `seededScores()`
- [ ] "JUGAR AHORA" en Detalle navega al **Reproductor**; el contador de puntuación se incrementa automáticamente
- [ ] "PAUSA" / "REANUDAR" detienen y reanudan el contador
- [ ] "FIN" muestra el modal de game-over con el score final
- [ ] El modal permite guardar el score e indica "PUNTUACIÓN GUARDADA"
- [ ] "VOLVER AL VAULT" desde cualquier pantalla regresa a Biblioteca
- [ ] El **Salón de la Fama** muestra podio y tabla; las pestañas cambian el juego activo
- [ ] Si hay `user` en estado, el Salón muestra la fila "TU MEJOR MARCA"
- [ ] La pantalla **Auth** muestra formulario de login/registro con tabs; submit llama a `onLogin` y navega a Biblioteca
- [ ] "JUGAR COMO INVITADO" cierra auth sin usuario
- [ ] El hash de la URL refleja la ruta activa (serialización JSON + encodeURIComponent)
- [ ] El estado de `user` persiste al recargar (localStorage `av_user`)
- [ ] El fondo animado (grid perspectiva + scanlines + noise) es visible en todas las pantallas
- [ ] La app es usable en móvil: el menú hamburguesa abre el panel lateral

---

## Decisiones tomadas y descartadas

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Un archivo `.tsx` por pantalla en `components/` | Todo en `page.tsx` | Legibilidad; el CLAUDE.md describe esta separación |
| Tipos en `components/data.ts` (mismo archivo que datos) | Archivo `types.ts` separado | El CLAUDE.md ya establece esta convención |
| Port 1:1 de la lógica de los templates | Refactorizar la máquina de estados | El spec es solo visual; cambios de arquitectura van en otro spec |
| Los divs `.av-bg` / `.av-noise` van en `page.tsx`, no en `layout.tsx` | `layout.tsx` | Son decoración de la app, no del layout global de Next.js |
| Sin pruebas automatizadas | Jest / Playwright | El CLAUDE.md indica "No test suite configured" |

---

## Riesgos identificados

- `globals.css` ya contiene la mayoría de los estilos del template pero puede faltar la sección CRT/arena y el modal. Verificar antes de implementar el paso 9.
- `app/layout.tsx` ya configura las fuentes con `--font-press-start` / `--font-jetbrains-mono`; confirmar que los alias `--pixel` / `--mono` en CSS los referencian correctamente (ya están en `globals.css`).
