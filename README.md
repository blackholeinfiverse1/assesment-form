# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase setup

Create `.env.local` with:

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_TABLE=students
```

Run the app:

```
npm run dev
```

## Gurukul module

The Gurukul learning flow (Seed → Tree → Sky) lives under `src/components/Gurukul.jsx` with sample data in `src/data/gurukul.js`.

- Tabs in the header let you switch between Students and Gurukul.
- Assessment results and progress are stored locally in `localStorage`.
- OAuth Sign-in uses Supabase (Google). Make sure the env vars above are set.

Schema reference: `gurukulSchemaV1_1` exported from `src/data/gurukul.js` mirrors the PM-provided JSON structure for v1.1.

## Auth (Clerk)

Optional: add to `.env.local` to enable Clerk auth UI and gate `/dashboard`:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC16ZWJyYS01OC5jbGVyay5hY2NvdW50cy5kZXYk
```

If not set, the app will run without Clerk; Dashboard will remain accessible.
