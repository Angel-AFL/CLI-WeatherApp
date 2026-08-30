import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "./types.ts";

const configPath = join(homedir(), ".weather-cli-config.json");

export async function loadConfig(): Promise<Config> {
  try {
    const file = Bun.file(configPath);
    if (await file.exists()) {
      const parsed = (await file.json()) as Partial<Config>;
      return {
        cities: Array.isArray(parsed.cities) ? parsed.cities : [],
        defaultCity: parsed.defaultCity ?? null,
        units: parsed.units === "fahrenheit" ? "fahrenheit" : "celsius",
      };
    }
  } catch {
    // fall through to defaults
  }
  return { cities: [], defaultCity: null, units: "celsius" };
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(configPath, JSON.stringify(config, null, 2));
}
