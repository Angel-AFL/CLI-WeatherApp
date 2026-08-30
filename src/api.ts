import type { City, Units } from "./types.ts";

interface GeocodingResponse {
  results?: { name: string; latitude: number; longitude: number }[];
}

interface ForecastResponse {
  current?: { temperature_2m?: number };
}

export class CityNotFoundError extends Error {
  constructor() {
    super("Ciudad no encontrada");
    this.name = "CityNotFoundError";
  }
}

export class WeatherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherError";
  }
}

export async function searchCity(name: string): Promise<City> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new WeatherError("Error al buscar la ciudad, intenta de nuevo");
  }
  const data = (await res.json()) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result) {
    throw new CityNotFoundError();
  }
  return { name: result.name, latitude: result.latitude, longitude: result.longitude };
}

export async function getWeather(city: City, units: Units): Promise<number> {
  const temperatureUnit = units === "fahrenheit" ? "fahrenheit" : "celsius";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&temperature_unit=${temperatureUnit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new WeatherError("Error al obtener el clima, intenta de nuevo");
  }
  const data = (await res.json()) as ForecastResponse;
  const temperature = data.current?.temperature_2m;
  if (temperature === undefined) {
    throw new WeatherError("No se encontró la temperatura para esta ciudad");
  }
  return temperature;
}
