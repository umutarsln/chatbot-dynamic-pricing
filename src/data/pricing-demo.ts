export const rooms = {
  standard: { name: "Standart oda", capacity: 60, base: 3200, min: 2600, max: 4800 },
  deluxe: { name: "Deluxe oda", capacity: 40, base: 4600, min: 3800, max: 6800 },
  suite: { name: "Deniz manzaralı süit", capacity: 20, base: 6800, min: 5600, max: 9800 },
} as const;

export type RoomType = keyof typeof rooms;

export const occupancyPattern = [68, 72, 79, 92, 96, 83, 64];
export const pricePattern = [0, .04, .08, .16, .2, .06, -.06];
export const reasons = ["Talep dengeli", "Rezervasyon ivmesi", "Artan talep", "Hafta sonu talebi", "Sınırlı müsaitlik", "Güçlü doluluk", "Doluluk fırsatı"];

