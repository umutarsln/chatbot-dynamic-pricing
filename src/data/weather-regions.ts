export const weatherRegions = [
  { id: "antalya", name: "Antalya merkez", latitude: 36.8969, longitude: 30.7133 },
  { id: "lara", name: "Lara", latitude: 36.8508, longitude: 30.8275 },
  { id: "belek", name: "Belek", latitude: 36.8628, longitude: 31.0556 },
  { id: "kemer", name: "Kemer", latitude: 36.6024, longitude: 30.5606 },
  { id: "side", name: "Side", latitude: 36.7675, longitude: 31.3889 },
  { id: "alanya", name: "Alanya", latitude: 36.5444, longitude: 31.9954 },
  { id: "kas", name: "Kaş", latitude: 36.2018, longitude: 29.6377 },
] as const;

export type WeatherRegion = (typeof weatherRegions)[number];
