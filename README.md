# sayseo.com

Premium SEO agency website built with Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Project Structure

```text
src/
  app/
    (marketing)/    Public marketing routes
    layout.tsx      Global metadata, fonts, and shell setup
    robots.ts       Robots rules
    sitemap.ts      Sitemap generation
  components/
    layout/         Header, footer, mobile navigation
    sections/home/  Homepage sections
    shared/         Reusable page-level building blocks
    ui/             Small composable primitives
  content/          Typed placeholder content and navigation data
  lib/              Small helpers
```

## Notes

- The contact flow opens a prefilled email draft instead of using a backend form handler.
- The architecture is ready to expand into blog posts, case studies, service detail pages, and future SEO landing pages.
