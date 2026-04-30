# Changelog

All notable changes to the PenguineDavid portfolio site are documented here.

---

## [Unreleased]

---

## [0.4.0] — 2026-04-30

### Added
- `localStorage` cache layer for all GitHub API responses (1-hour TTL per key)
- In-memory runtime cache on top of localStorage — zero storage reads per session after first command
- `cache` command — shows hit/miss status, age, and size for each cached key
- `cache refresh` subcommand — clears all cached data and forces a full re-fetch on next command
- Boot sequence now reports cache state on startup (what's cached and how old)
- Cache age shown inline after each command that uses GitHub data

### Changed
- Commands now log whether data is coming from cache or live API in the loading message

---

## [0.2.0] — 2026-04-30

### Added
- Live GitHub API integration — `whoami`, `skills`, `projects` all fetch real data
- `getProfile()` — hits `GET /users/PenguineDavid`
- `getRepos()` — fetches pages 1 & 2 in parallel, deduplicates by `id`, filters forks
- `getLanguages()` — aggregates raw bytes per language across all own repos, converts
  to percentages matching GitHub's own language bar methodology
- `LANG_META` map — descriptions for known languages shown under each bar
- `Creative Technical` section in `skills` for non-language skills (static)
- Repo list in `projects` pulled live: name, language, stars, description, last push date
- Profile data in `whoami`: name, bio, location, repo count, followers, company

### Changed
- `skills` language bars now reflect real GitHub language breakdown rather than hardcoded values

---

## [0.1.0] — 2026-04-30

### Added
- Initial release
- Canvas-based matrix rain background: binary + corrupt glyph columns, variable speed,
  glitch columns, burst mode (triggered on keypress), idle mode (slows rain after inactivity)
- Spinning ASCII donut overlay rendered on top of rain (no blur)
- CRT effects: scanline gradient overlay, radial vignette, screen flicker animation
- macOS-style top bar: red/yellow/green traffic light dots, centered title, live UTC clock
- Terminal command interface: `help`, `whoami`, `skills`, `projects`, `contact`, `clear`
- Classic bash prompt colours: `user@host` green, path blue, `$` white
- Margin popups: random hacker-aesthetic panels that appear on keypress and flicker out
- Boot sequence with typewriter effect and `PD` ASCII logo
- Arrow key command history, Tab autocomplete, Ctrl+L to clear
- Green dot → fullscreen toggle
- Hosted as single `index.html` — deployable directly to GitHub Pages (`PenguineDavid.github.io`)
