# AGENTS.md

## Runtime

- This is a **Bun** project (Bun 1.x). Use `bun` for install/run — never `npm`/`yarn`. Lockfile is `bun.lock`; install with `bun install`.
- No npm scripts are defined in `package.json`. Run the CLI with `bun run index.ts`.
- Typecheck with `bunx tsc` (tsconfig has `noEmit`, so it only type-checks). No test or lint setup exists.

## Code conventions

- `index.ts` is the single entrypoint. Import local `.ts` files with explicit `.ts` extensions (required by `allowImportingTsExtensions` + `verbatimModuleSyntax`).
- The app is currently a stub (`console.log("Hello via Bun!")`). `README.md` is the authoritative spec — the CLI is an interactive Spanish-language weather app with a numbered menu (weather of default city, all saved cities, search/add/remove city, set default, units toggle).

## Weather API

- Uses OpenMeteo, no API key needed. Two-step flow: geocoding (`https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`) → forecast (`https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`). Exact URLs in README.
- UI strings, city data, and persistence should use Spanish, matching the spec.

## Build

- Deliverable includes a compiled binary: `bun build ./index.ts --compile --outfile weather`.
