# AGENTS.md

## Runtime

- **Bun** project (Bun 1.x). Use `bun` for install/run — never `npm`/`yarn`. Install with `bun install` (lockfile `bun.lock`).
- `package.json` has `start`/`dev`/`build` scripts, but the repo convention is `bun run index.ts` for running and `bun run build` for the binary.
- Typecheck with `bunx tsc` (tsconfig `noEmit`, so it only type-checks). No test or lint setup exists — verify manually by piping stdin into the CLI (see Persistence).

## Code conventions

- `index.ts` is the single entrypoint; it calls `run()` from `src/app.ts`. Logic lives in `src/`: `types.ts` (City/Config/Units), `storage.ts` (persistence), `api.ts` (OpenMeteo), `colors.ts` (ANSI helpers), `app.ts` (menu loop).
- Import local `.ts` files with explicit `.ts` extensions (required by `allowImportingTsExtensions` + `verbatimModuleSyntax`).
- User input is read with Bun's global `prompt(...)` (no import needed); it prints a message and reads one stdin line.
- All UI strings, city data, and persistence are in Spanish, matching `README.md` (the authoritative spec).
- The menu numbering deliberately skips 6/7 (`1,2,3,4,5,8,9`); preserve that layout from the README.
- Colors (`src/colors.ts`) emit ANSI codes only when `process.stdout.isTTY`; piped output is plain, so lack of color in tests is expected, not a bug.

## Persistence

- Config (`Config` shape) lives in `~/.weather-cli-config.json` via `os.homedir()` (`src/storage.ts`) — NOT in the repo.
- Gotcha: running the app reads/writes the real user config. To test with clean state, override `USERPROFILE` (Windows) or `HOME` to a temp dir before piping stdin, e.g. `"1`n9" | bun run index.ts`.

## Weather API

- OpenMeteo, no API key. Two-step: geocoding (`https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`) → forecast (`https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`).
- The forecast URL always includes `&temperature_unit=<unit>` (`celsius` or `fahrenheit`).

## Build

- Deliverable is a compiled binary: `bun build ./index.ts --compile --outfile weather`. On Windows this produces `weather.exe`, which is gitignored.
