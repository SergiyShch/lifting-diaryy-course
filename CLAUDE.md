# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Requirement

**Before generating any code, Claude Code MUST first read and refer to the relevant documentation file(s) in the `/docs` directory.** The `/docs` directory contains project-specific guidance that takes precedence over general knowledge. Always check for an applicable doc before writing or modifying code.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture

This is a **Next.js 16 App Router** project with TypeScript, Tailwind CSS v4, and React 19.

**Key conventions:**
- All source code lives under `src/`
- Path alias `@/` maps to `src/` (e.g., `import { foo } from "@/components/foo"`)
- Pages and layouts use the App Router convention in `src/app/`
- Styling is done with Tailwind CSS v4 — use `@import "tailwindcss"` in CSS files, not `@tailwind` directives
- CSS custom properties for theming are defined in `src/app/globals.css`; dark mode uses `prefers-color-scheme`
- Fonts are loaded via `next/font/google` in the root layout and applied as CSS variables (`--font-geist-sans`, `--font-geist-mono`)
- ESLint uses the v9 flat config format (`eslint.config.mjs`) with `eslint-config-next`
