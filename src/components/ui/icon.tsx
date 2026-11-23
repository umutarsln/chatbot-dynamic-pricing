const paths = {
  overview: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  calendar: "M8 2v4m8-4v4M3 10h18M3 5h18v16H3z",
  competitors: "M3 20h18M5 16v-4m7 4V4m7 12V8",
  rules: "M4 7h16M4 17h16M8 4v6m8 4v6",
  sparkle: "m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z",
  download: "M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5",
  hotel: "M4 21V5h11v16M15 10h5v11M2 21h20M8 9h3m-3 4h3m-3 4h3",
  panel: "M3 4h18v16H3zM9 4v16m7-11-3 3 3 3",
  down: "m7 10 5 5 5-5",
  up: "m5 16 6-6 4 4 5-9m-6 0h6v6",
  check: "m5 12 4 4L19 6",
  revenue: "M3 3v18h18M7 14l4-4 4 3 6-8",
  weather: "M5 16a4 4 0 1 1 1-7 6 6 0 0 1 11 1 3 3 0 1 1 1 6H5z",
} as const;

export function Icon({ name, size = 18 }: { name: keyof typeof paths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

