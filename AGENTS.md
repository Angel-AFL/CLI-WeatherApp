# AGENTS.md

## Runtime

- **Bun** project (Bun 1.x). Use `bun` for install/run — never `npm`/`yarn`. Install with `bun install` (lockfile `bun.lock`).
- `package.json` has `start`/`dev`/`build` scripts, but the repo convention is `bun run index.ts` for running and `bun run build` for the binary.
- Typecheck with `bunx tsc` (tsconfig `noEmit`, so it only type-checks). No test or lint setup exists.

## Code conventions

- `index.ts` is the single entrypoint; it calls `run()` from `src/app.ts`. Logic lives in `src/`: `types.ts` (City/Config/Units), `storage.ts` (persistence), `api.ts` (OpenMeteo), `colors.ts` (ANSI helpers), `app.ts` (menu loop).
- Import local `.ts` files with explicit `.ts` extensions (required by `allowImportingTsExtensions` + `verbatimModuleSyntax`).
- User input is read with Bun's global `prompt(...)` (no import needed); it prints a message and reads one stdin line.
- All UI strings, city data, and persistence are in Spanish, matching `README.md` (the authoritative spec).
- The menu numbering deliberately skips 6/7 (`1,2,3,4,5,8,9`); preserve that layout from the README.
- Colors (`src/colors.ts`) emit ANSI codes only when `process.stdout.isTTY`; piped output is plain, so lack of color in tests is expected, not a bug.
- tsconfig enables `noUncheckedIndexedAccess`: array reads are `T | undefined`. After a bounds check, use `arr[i]!` (app.ts uses this pattern, e.g. in `addCity`).
- Cities are deduplicated by `latitude,longitude` (`cityKey` in app.ts), not by name.

## Persistence

- Config (`Config` shape) lives in `~/.weather-cli-config.json` via `os.homedir()` (`src/storage.ts`) — NOT in the repo.
- Gotcha: `configPath` is a module-level constant, computed from `homedir()` at import time. To test with clean state, override `USERPROFILE` (Windows) or `HOME` in the shell **before launching the process** (e.g. `$env:USERPROFILE = <temp>` then `bun run index.ts`). Setting `process.env` at runtime inside a script is too late and won't take effect.
- Running the app reads/writes the real user config, so always point at a temp home when testing.

## Weather API

- OpenMeteo, no API key. Two-step: geocoding (`https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=5&language=es&format=json`) → forecast (`https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`).
- `searchCity` (in `src/api.ts`) returns `City[]` (up to 5). `addCity` lists ambiguous matches with `country`/`admin1` (optional `City` fields used only for disambiguation display) and asks the user to pick; a single match skips the prompt.
- The forecast URL always includes `&temperature_unit=<unit>` (`celsius` or `fahrenheit`).

## Testing gotcha (Bun piped stdin)

- On non-TTY stdin, Bun's `prompt()` can merge several piped lines into one read (byte-count dependent, Windows). Single-prompt smoke tests like `"1`n9" | bun run index.ts` work, but multi-prompt flows (menu → submenu → confirm) are **not** reliably drivable via pipe.
- To verify a flow deterministically, mock `globalThis.prompt` in a small script with a queue of inputs instead of piping stdin.

## Build

- Deliverable is a compiled binary: `bun build ./index.ts --compile --outfile weather`. On Windows this produces `weather.exe`, which is gitignored.
