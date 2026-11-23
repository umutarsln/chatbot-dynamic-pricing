This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Dynamic Pricing — OTA-271

Pages: `/dashboard`, `/pricing-calendar`, `/price-recommendations`, `/competitors`, `/pricing-rules`, `/weather`. `/` redirects to `/dashboard`. Weather loads only when entering `/weather`; the region can be changed there. Shared pricing selections and preview changes survive client navigation and reset on full reload.

See [weather integration and provider comparison](docs/integrations/weather-data.md) for supported regions, setup, behavior, historical data options, and official sources. Run `pnpm test` for weather adapter tests.

Historical weather: `/weather/history`. ERA5 daily records are stored in `var/weather.sqlite` (ignored by git). Requires Node 22.18+ and a persistent writable disk; set `WEATHER_HISTORY_DB_PATH` for the deployment volume. See [archive behavior and storage](docs/context/backend/weather-history.md).
