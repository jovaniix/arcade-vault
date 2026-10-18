# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



No test suite configured.

## Skills
Usa siempre /frontend-design para disenar la interfaz de usuario.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** via `@tailwindcss/turbopack` (imported in `globals.css` with `@import "tailwindcss"`)
- Fonts: `Press Start 2P` (pixel/heading) and `JetBrains Mono` (body) — exposed as CSS vars `--font-press-start` / `--font-jetbrains-mono`, aliased to `--pixel` and `--mono`




## Architecture

Single-page app — the entire UI lives in `app/page.tsx` (`"use client"`). Navigation is a client-side state machine:

- `route` state (type `Route` from `components/data.ts`) drives which screen component renders
- Current route is serialized into `location.hash` so the URL is shareable
- `user` state (type `User`) is persisted to `localStorage` key `av_user`
- Scores are appended to `localStorage` key `av_scores`

### Screens / components

| Route name | Component | Purpose |
|---|---|---|
| `biblioteca` | `Library` | Game grid with category filter |
| `detalle` | `GameDetail` | Game detail page |
| `player` | `GamePlayer` | Simulated game session (score auto-increments via interval) |
| `auth` | `Auth` | Login/register (localStorage only, no backend) |
| `salon` | `HallOfFame` | Leaderboard |

### Data

All static game data and types live in `components/data.ts`:
- `GAMES` array — 8 arcade games with metadata
- `Route` / `User` / `Game` / `ScoreRow` types
- `seededScores()` — generates deterministic fake leaderboard rows from a numeric seed

### Styling

`app/globals.css` defines the full design system: CSS custom properties for colors (`--cyan`, `--magenta`, `--yellow`, `--green`), backgrounds (`--bg`, `--bg-2`, `--bg-3`), and utility classes (`.btn`, `.pixel`, `.mono`, `.fade-in`, `.crt`, `.modal-bd`, etc.). No Tailwind utility classes in components — the project uses Tailwind's base reset + the custom CSS system.

## Notes

- `AGENTS.md` is auto-managed by `next dev` — commit it as-is, don't remove it.
- `experimental.agentFeedback` is enabled in `next.config.ts`; `next dev` may run a reporting pass.
- No routing library — navigation is purely prop-drilled `navigate(route)` callbacks.
- Auth is fake (localStorage only); there is no backend or API.
