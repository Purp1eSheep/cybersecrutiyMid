# Repository Guidelines

## Project Structure & Module Organization

This repository contains a static study app built with Vite, React, and TypeScript. Application code lives in `src/`: `pages/` contains the main screens, `components/` shared UI, and `lib/` question selection, shuffling, statistics, and browser storage logic. The question bank is `src/data/questions.json`; its Zod schema is in `src/schema.ts`. See `SCHEMA.md` before editing question data. `scripts/validate.ts` checks the bank. The `questions/` Markdown files are chapter references, while `public/` holds static assets. GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.

## Project Navigation

Start at `src/main.tsx` for app initialization and `src/App.tsx` for top-level screen flow and practice state. To change a screen, open its file in `src/pages/`; for shared controls, look in `src/components/`. For question filtering or practice order, start in `src/lib/questions.ts` and `src/lib/shuffle.ts`; for scoring and persistence, use `src/lib/stats.ts` and `src/lib/storage.ts`. When changing question fields or content, trace the contract through `src/types.ts`, `src/schema.ts`, `src/data/questions.json`, and `SCHEMA.md`. The matching chapter notes are in `questions/`. Global styling is in `src/index.css`; static browser assets are in `public/`.

## Build, Test, and Development Commands

Run `npm install` to install dependencies and `npm run dev` to start the local Vite server. Use `npm run validate` after changing question data, and `npm run typecheck` to run TypeScript without emitting files. `npm run build` runs validation and type checking before creating `dist/`. Run `npm run preview` to serve that production build locally. There is no dedicated test script configured.

## Coding Style & Naming Conventions

Follow the existing TypeScript and TSX patterns: two-space indentation, semicolons, single-quoted strings where practical, and explicit types for shared data and interfaces. Use PascalCase for React component files and component names (for example, `Dashboard.tsx`), and camelCase for utilities and functions (for example, `shuffle.ts`). Keep business logic in `src/lib/` and UI in components or pages. Avoid adding dependencies unless the existing stack cannot reasonably support the change.

## Testing Guidelines

Before submitting code changes, run `npm run typecheck` and `npm run build`; the build includes question-bank validation. For question edits, also run `npm run validate` directly for a focused check. No test framework or coverage threshold is currently configured; add focused tests if introducing behavior that is difficult to verify through the existing checks.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no repository-specific commit convention could be confirmed. Use short imperative commit subjects, such as `Fix question shuffle order`. Pull requests should summarize the user-visible change, list relevant validation commands and results, and include screenshots for visual changes. Link related issues when applicable.

## Security & Configuration Tips

The app has no backend; study progress is stored in browser `localStorage`. Keep secrets and credentials out of the repository. Question content is shipped to the browser as static data, so do not put private or sensitive material in the question bank.
