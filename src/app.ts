import { getWeather, searchCity } from "./api.ts";
import { loadConfig, saveConfig } from "./storage.ts";
import type { City, Config, Units } from "./types.ts";

const divider = "═".repeat(40);

const unitSymbol = (units: Units): string => (units === "fahrenheit" ? "°F" : "°C");

function renderMenu(config: Config): void {
  console.log(divider);
  console.log("         WEATHER CLI");
  console.log(divider);
  console.log(`  1. Clima de ciudad default`);
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log(`  3. Buscar y agregar ciudad`);
  console.log(`  4. Eliminar ciudad`);
  console.log(`  5. Establecer ciudad default`);
  console.log(`  8. Ajustes (${unitSymbol(config.units)})`);
  console.log(`  9. Salir`);
  console.log(divider);
}

function cityKey(city: City): string {
  return `${city.latitude},${city.longitude}`;
}

function showWeather(city: City, temperature: number, units: Units): void {
  console.log(`  ${city.name}: ${temperature}${unitSymbol(units)}`);
}

async function showCityWeather(city: City, units: Units): Promise<void> {
  try {
    const temperature = await getWeather(city, units);
    showWeather(city, temperature, units);
  } catch (error) {
    console.log(`  Error con ${city.name}: ${messageOf(error)}`);
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Error inesperado";
}

async function showDefaultWeather(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log("  No hay una ciudad default. Usa la opción 5 para establecerla.");
    return;
  }
  await showCityWeather(config.defaultCity, config.units);
}

async function showAllWeather(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const city of config.cities) {
    await showCityWeather(city, config.units);
  }
}

async function addCity(config: Config): Promise<void> {
  const name = prompt("  Nombre de la ciudad: ")?.trim();
  if (!name) {
    console.log("  No ingresaste un nombre.");
    return;
  }
  try {
    const city = await searchCity(name);
    if (config.cities.some((c) => cityKey(c) === cityKey(city))) {
      console.log(`  "${city.name}" ya está en la lista.`);
      return;
    }
    console.log(`  Se encontró: ${city.name} (${city.latitude}, ${city.longitude})`);
    const answer = prompt("  ¿Quieres agregarla? (s/n): ")?.trim().toLowerCase();
    if (answer !== "s" && answer !== "si") {
      console.log("  Operación cancelada.");
      return;
    }
    config.cities.push(city);
    await saveConfig(config);
    console.log(`  "${city.name}" agregada.`);
  } catch (error) {
    console.log(`  ${messageOf(error)}`);
  }
}

function selectCity(config: Config): City | null {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades guardadas.");
    return null;
  }
  config.cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${city.name}`);
  });
  const raw = prompt("  Selecciona una ciudad: ")?.trim();
  const index = Number(raw) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    console.log("  Opción inválida.");
    return null;
  }
  return config.cities[index] ?? null;
}

async function removeCity(config: Config): Promise<void> {
  const city = selectCity(config);
  if (!city) {
    return;
  }
  const index = config.cities.indexOf(city);
  config.cities.splice(index, 1);
  if (config.defaultCity && cityKey(config.defaultCity) === cityKey(city)) {
    config.defaultCity = null;
    console.log("  Se eliminó la ciudad default.");
  }
  await saveConfig(config);
  console.log(`  "${city.name}" eliminada.`);
}

async function setDefaultCity(config: Config): Promise<void> {
  const city = selectCity(config);
  if (!city) {
    return;
  }
  config.defaultCity = city;
  await saveConfig(config);
  console.log(`  "${city.name}" establecida como ciudad default.`);
}

async function toggleUnits(config: Config): Promise<void> {
  config.units = config.units === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  console.log(`  Unidades cambiadas a ${unitSymbol(config.units)}.`);
}

export async function run(): Promise<void> {
  const config = await loadConfig();
  let running = true;
  while (running) {
    renderMenu(config);
    const option = prompt("  Selecciona una opción: ")?.trim();
    switch (option) {
      case "1":
        await showDefaultWeather(config);
        break;
      case "2":
        await showAllWeather(config);
        break;
      case "3":
        await addCity(config);
        break;
      case "4":
        await removeCity(config);
        break;
      case "5":
        await setDefaultCity(config);
        break;
      case "8":
        await toggleUnits(config);
        break;
      case "9":
        running = false;
        break;
      default:
        console.log("  Opción inválida, intenta de nuevo.");
    }
    if (running) {
      console.log();
    }
  }
}
