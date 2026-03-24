# Stack Research

**Domain:** Browser-only charitable donation itemizer / tax deduction calculator (pure frontend, no backend)
**Researched:** 2026-03-23
**Confidence:** HIGH — all versions verified against npm as of research date

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.0.1 | Build tool / dev server | Fastest dev HMR in class; produces a static `dist/` that deploys anywhere; official React template ships with SWC for sub-100ms rebuilds. Requires Node 20.19+ |
| React | 19.2.4 | UI component layer | Current stable. Concurrent features (useTransition) are useful for the live-updating total dashboard without blocking the input field. No breaking changes vs v18 for this use case |
| TypeScript | 5.x (bundled with Vite template) | Type safety | The data model (DonationLog, DonationItem, Condition) maps directly to interfaces; catches FMV range arithmetic errors at compile time rather than at tax time |
| Tailwind CSS | 4.2.2 | Styling | v4 ships with a Vite plugin — no PostCSS config, no content globs, single `@import "tailwindcss"` in CSS. JIT-only in v4 means no purge configuration needed. Mobile-first utility classes match the responsive requirement (375px → 1440px) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **zustand** | 5.0.12 | Global donation log state + localStorage persistence | Use for the `DonationLog` store. The built-in `persist` middleware with `createJSONStorage(localStorage)` gives you cross-session persistence in ~10 lines. Supports `version` field and `migrate` callback for future FMV data schema changes — exactly what the spec requires for "data structure that supports future year updates" |
| **@react-pdf/renderer** | 4.3.2 | PDF export | Generates real vector PDF (text is selectable, searchable, copyable) in the browser with no server. Define the IRS-style export document as React components using `<Document>`, `<Page>`, `<View>`, `<Text>`. Supports tables via flexbox layout. Use this over html2canvas+jsPDF because the output is structured text, not a rasterized screenshot — which matters for a tax document |
| **react-hook-form** | 7.72.0 | Form handling (donor info, item quantities, dates) | Uncontrolled by default; 12 KB gzipped vs Formik's 44 KB. Zero re-renders on keystroke for inputs the user isn't watching. Use for the donor info header form and the item-add flow |
| **zod** | 3.x | Schema validation for forms and localStorage deserialization | Pair with `@hookform/resolvers/zod` for form validation. Also use `.safeParse()` when reading back from localStorage to guard against stale/malformed persisted data from a previous schema version |
| **@hookform/resolvers** | 3.x | Bridge between zod and react-hook-form | Required for `zodResolver(schema)` in `useForm()` |
| **lucide-react** | 0.577.0 | SVG icons | Tree-shakable; only imported icons ship. Per CLAUDE.md: no emoji icons. Use for +/-, trash, calendar, download, flag icons throughout the UI |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@vitejs/plugin-react-swc` | SWC-based React transform | Use instead of Babel plugin; 10-20x faster HMR on save. Included in Vite's `react-ts` scaffolding |
| `@tailwindcss/vite` | Tailwind v4 Vite integration | Replaces PostCSS entirely in v4. Add to `plugins` array in `vite.config.ts` alongside `react()` |
| Vitest | Unit testing (optional v1) | Ships with Vite's ecosystem; zero additional config for a Vite project. Use for FMV calculation logic and localStorage migration functions |
| TypeScript strict mode | Type safety | Enable `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` in `tsconfig.app.json` |

---

## Installation

```bash
# Scaffold project (uses SWC React template)
npm create vite@latest donation-itemizer -- --template react-ts

cd donation-itemizer

# Tailwind v4 with Vite plugin
npm install tailwindcss @tailwindcss/vite

# State + persistence
npm install zustand

# PDF export
npm install @react-pdf/renderer

# Forms + validation
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# Dev tools (already in scaffold, listed for clarity)
# @vitejs/plugin-react-swc, typescript, vitest — included by template
```

**vite.config.ts after setup:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css after setup:**
```css
@import "tailwindcss";
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| zustand `persist` | Hand-rolled `useLocalStorage` hook | Only if the state is a single flat object and you never need schema migration. Fails once the DonationItem shape changes between releases |
| zustand `persist` | Redux Toolkit + redux-persist | If the team already has Redux expertise and the app will grow to enterprise scale. Overkill for this scope |
| @react-pdf/renderer | jsPDF + html2canvas | If you already have a fully styled HTML page and want to screenshot it as a PDF. Produces rasterized, non-selectable text — not suitable for a tax document users may need to copy values from |
| @react-pdf/renderer | pdfmake | If your team prefers JSON config over JSX. pdfmake has better raw table support out of the box, but requires learning a separate DSL instead of React components |
| @react-pdf/renderer | `window.print()` with print CSS | Zero dependencies and produces native print dialog. Valid fallback if PDF library proves complex, but gives user less control over filename/destination and no guaranteed layout consistency across browsers |
| react-hook-form | Native controlled `useState` inputs | For this app's quantity editor (+/-) and FMV slider, controlled state is fine because they are discrete interactions with immediate side effects. Use `useState` for those specific controls and RHF only for the form-like screens (donor info, add item) |
| zod | yup | Both work with `@hookform/resolvers`. Zod produces TypeScript types from schemas via `z.infer<>`, which DRYs up the data model — types and validation live in one place |
| Vite | Create React App | CRA is officially unmaintained. Do not use |
| Tailwind v4 | Tailwind v3 | v3 requires `tailwind.config.js` and PostCSS. Only use v3 if a third-party component library you depend on hasn't upgraded yet. This project has no such dependency |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Formik** | GitHub repo has had no meaningful commits in 18+ months; bundle is 44 KB vs RHF's 12 KB; uses controlled components causing excessive re-renders | react-hook-form |
| **html2canvas + jsPDF** | PDF output is a rasterized image — text is not selectable, file sizes are large (2-5 MB for a single page), and layout breaks on different screen resolutions/DPI | @react-pdf/renderer |
| **Create React App** | Officially unmaintained since 2023; slow cold starts; no native ESM | Vite |
| **Redux / Redux Toolkit** | Significant boilerplate for a single-page frontend tool with no server state; overkill when zustand handles the same in 30 lines | zustand |
| **localStorage direct calls in components** | No reactive updates, no schema migration, no serialization safety | zustand `persist` middleware with zod deserialization guard |
| **Tailwind v3** | Requires PostCSS + `tailwind.config.js` + content glob configuration; deprecated in favor of v4 for new projects | Tailwind v4 with `@tailwindcss/vite` plugin |
| **moment.js** | 300 KB bundle; deprecated by maintainers | Native `Date` / `Intl.DateTimeFormat` — this app only needs ISO date strings and formatted display, both achievable natively |
| **date-fns or dayjs** | Not needed for this use case | Native `Date` constructor + `toISOString()` + `Intl.DateTimeFormat` for display formatting |

---

## Stack Patterns by Variant

**For the FMV data file (`src/data/fmv.ts`):**
- Use a plain TypeScript `const` object keyed by `tax_year` → `category` → `item_slug`
- Type the structure with a `FMVEntry` interface: `{ low: number; mid: number; high: number; unit: string; notes?: string }`
- Annual updates = edit one file, no migration needed (FMV data is read-only at runtime)
- Do NOT store FMV data in zustand or localStorage — it's static and ships with the bundle

**For localStorage schema versioning:**
- Use zustand `persist` with a `version: 1` field and a `migrate` function
- When the `DonationItem` shape changes in a future year, increment version and transform old data in `migrate`
- Use `zod.safeParse()` on the raw localStorage value before hydrating to catch pre-migration corruption

**For the PDF export:**
- Create a dedicated `src/pdf/DonationReport.tsx` that accepts `DonationLog` as props and returns `<Document>`
- Keep PDF components completely separate from screen components — they use `@react-pdf/renderer`'s layout primitives, not HTML/Tailwind
- Register any custom fonts with `Font.register()` before rendering

**For deployment (pure static):**
- `npm run build` → `dist/` folder
- Netlify: set build command `npm run build`, publish directory `dist`
- Vercel: auto-detects Vite, no config needed
- GitHub Pages: use `vite-plugin-gh-pages` or the standard `gh-pages` npm package with `base` set in `vite.config.ts`
- No server, no environment variables, no serverless functions required for v1

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@react-pdf/renderer@4.3.2` | `react@19.x` | v4 dropped Node <16 support; confirmed React 19 compatible |
| `tailwindcss@4.2.2` + `@tailwindcss/vite` | `vite@8.x` | v4 Vite plugin is the only supported integration path; do not combine with PostCSS |
| `zustand@5.0.x` | `react@19.x` | Zustand v5 supports React 19 concurrent features; v4 had issues with `useSyncExternalStore` under React 19 strict mode |
| `react-hook-form@7.72.x` | `react@19.x` | RHF v7 is React 19 compatible; no known issues |
| `zod@3.x` | `@hookform/resolvers@3.x` | Must use resolvers v3+ for RHF v7 compatibility |

---

## Sources

- [npm: @react-pdf/renderer](https://www.npmjs.com/package/@react-pdf/renderer) — v4.3.2 verified
- [npm: zustand](https://www.npmjs.com/package/zustand) — v5.0.12 verified; persist middleware docs at zustand.docs.pmnd.rs
- [npm: react-hook-form](https://www.npmjs.com/package/react-hook-form) — v7.72.0 verified
- [npm: tailwindcss](https://www.npmjs.com/package/tailwindcss) — v4.2.2 verified; v4 blog post confirms Vite plugin approach
- [npm: vite](https://www.npmjs.com/package/vite) — v8.0.1 verified
- [npm: react](https://www.npmjs.com/package/react) — v19.2.4 verified
- [npm: lucide-react](https://www.npmjs.com/package/lucide-react) — v0.577.0 verified
- [Tailwind CSS v4 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — confirms Vite plugin, no PostCSS needed, single CSS import
- [Zustand persist docs](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) — version + migrate pattern confirmed
- [react-hook-form vs formik comparison — Refine](https://refine.dev/blog/react-hook-form-vs-formik/) — bundle size and maintenance status
- [jsPDF vs @react-pdf/renderer — npm-compare](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf) — approach differences
- [PDF generation comparison 2025 — Joyfill](https://joyfill.io/blog/comparing-open-source-pdf-libraries-2025-edition) — rasterized vs vector tradeoff
- [Vite + React + Tailwind v4 setup guide — DEV Community](https://dev.to/imamifti056/how-to-setup-tailwind-css-v415-with-vite-react-2025-updated-guide-3koc) — confirmed current setup flow

---

*Stack research for: charitable donation itemizer, pure frontend, no backend*
*Researched: 2026-03-23*
