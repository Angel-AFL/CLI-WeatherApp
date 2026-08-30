# AGENTS.md

## Runtime

- **Bun** project (Bun 1.x). Use `bun` for install/run — never `npm`/`yarn`. Install with `bun install` (lockfile `bun.lock`).
- No npm scripts in `package.json`. Run the CLI with `bun run index.ts`.
- Typecheck with `bunx tsc` (tsconfig `noEmit`, so it only type-checks). No test or lint setup exists — verify manually by piping stdin into the CLI (see Persistence).

## Code conventions

- `index.ts` is the single entrypoint; it calls `run()` from `src/app.ts`. Logic lives in `src/`: `types.ts` (City/Config/Units), `storage.ts` (persistence), `api.ts` (OpenMeteo), `app.ts` (menu loop).
- Import local `.ts` files with explicit `.ts` extensions (required by `allowImportingTsExtensions` + `verbatimModuleSyntax`).
- User input is read with Bun's global `prompt(...)` (no import needed); it prints a message and reads one stdin line.
- All UI strings, city data, and persistence are in Spanish, matching `README.md` (the authoritative spec).
- The menu numbering deliberately skips 6/7 (`1,2,3,4,5,8,9`); preserve that layout from the README.

## Persistence

- Config (`Config` shape) lives in `~/.weather-cli-config.json` via `os.homedir()` (`src/storage.ts`) — NOT in the repo.
- Gotcha: running the app reads/writes the real user config. To test with clean state, override `USERPROFILE` (Windows) or `HOME` to a temp dir before piping stdin, e.g. `"1`n9" | bun run index.ts`.

## Weather API

- OpenMeteo, no API key. Two-step: geocoding (`https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`) → forecast (`https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`).
- For °F, append `&temperature_unit=fahrenheit` to the forecast URL; °C is the default and passes nothing.

## Build

- Deliverable is a compiled binary: `bun build ./index.ts --compile --outfile weather`. On Windows this produces `weather.exe`, which is gitignored.
