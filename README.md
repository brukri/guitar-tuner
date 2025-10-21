# Guitar Tuner (Vite + React)

A simple web guitar tuner built with React and the Web Audio API.

This app runs entirely in the browser and requests access to your microphone to detect pitch. No audio is uploaded.

## Develop locally

- Install dependencies: `pnpm i` (or `npm i` / `yarn`)
- Start dev server: `pnpm dev`
- Build for production: `pnpm build` (outputs to `dist/`)
- Preview production build: `pnpm preview`

## Deploying (recommended: Vercel)

Vercel has zero‑config support for Vite apps.

### Option A — Deploy via Git (UI)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Go to https://vercel.com/new and import your repository.
3. Framework Preset: Vite (auto-detected).
4. Build Command: `pnpm build` (or `npm run build`).
5. Output Directory: `dist` (auto-detected).
6. Click Deploy.

### Option B — Deploy from your machine (Vercel CLI)
1. Install CLI: `pnpm add -g vercel` (or `npm i -g vercel`).
2. Build locally (optional): `pnpm build`.
3. Run `vercel` and follow prompts to deploy. For production: `vercel --prod`.

No vercel.json is required. If you prefer one, this minimal file is sufficient:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist"
}
```

## Alternatives

### Netlify
- New site -> Import from Git.
- Build command: `pnpm build`.
- Publish directory: `dist`.

Or via CLI:
- `pnpm add -g netlify-cli`
- `pnpm build`
- `netlify deploy` (for a draft)
- `netlify deploy --prod` (for production)

### GitHub Pages
Two easy options:

Option A — GitHub Actions (auto deploy on push)
- Ensure your default branch is `main` or `master`.
- Push this repo to GitHub.
- Pages settings: Repository Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
- This repo already includes .github/workflows/deploy-pages.yml which will:
  - build with PNPM, set the correct Vite base path for your repo name, and publish `dist/` to Pages.
- On the next push to main/master, it will deploy to https://<your-username>.github.io/<repo-name>/.

Option B — Manual publish of dist/
- `pnpm build`
- Put the contents of `dist/` on a `gh-pages` branch (e.g., with `gh-pages` package) or upload via the Pages artifact UI).
- If deploying to a subpath (e.g., `/repo-name/`), the included workflow or setting `base` in `vite.config.ts` will handle correct asset paths.

## Microphone and HTTPS notes
- Browsers require a secure context (HTTPS) for `getUserMedia` microphone access.
- Production deploys on Vercel/Netlify/Pages use HTTPS by default, so it works there.
- Locally, Vite dev server works on `http://localhost` which is considered a secure context by browsers.
- On first use, the browser will ask for microphone permission. Ensure your input device is selected in OS/browser settings if you see no response.

## Troubleshooting
- Blank page after deploy: ensure the output directory is `dist` and the build command runs without errors.
- App not detecting mic: confirm you are on HTTPS and have granted mic permissions; check system input levels.
- 404s on refresh (SPA): Vercel/Netlify handle SPA routes automatically. If using other hosts, ensure SPA fallback to `index.html`.

## Tech stack
- Vite 5 + React 18 + TypeScript
- Web Audio API for pitch detection

