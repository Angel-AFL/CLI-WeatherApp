export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export type Units = "celsius" | "fahrenheit";

export interface Config {
  cities: City[];
  defaultCity: City | null;
  units: Units;
}
