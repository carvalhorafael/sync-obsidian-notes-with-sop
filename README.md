# SOP Mission Control Sync for Obsidian

Obsidian community plugin to sync structured notes from an Obsidian vault to SOP Mission Control.

## Project status

This repository started from the official Obsidian sample plugin and is in transition from scaffold to product.
Some sample behavior still exists in the codebase.

## Product intent

SOP Mission Control is Rafael's personal operating system for two business fronts:

- `Executive`: Quest Edu operations, decisions, meetings, tasks, and weekly review.
- `Creator`: content production and distribution for Rafael's personal brand.

The plugin turns Obsidian into a structured capture and reflection surface that can push relevant notes into Mission Control without manual copy/paste.

## Repository structure

Current relevant files:

- `src/main.ts`: plugin entrypoint and lifecycle
- `src/settings.ts`: plugin settings and settings tab
- `manifest.json`: plugin metadata
- `docs/project-context.md`: business and product context
- `docs/v1-scope.md`: detailed scope and architecture
- `AGENTS.md`: project instructions and persistent context

## Development

Install dependencies:

```bash
npm install
```

Start watch mode:

```bash
npm run dev
```

Run a production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Documentation

- [`docs/project-context.md`](docs/project-context.md)
- [`docs/v1-scope.md`](docs/v1-scope.md)
- [`docs/meeting-note-template.md`](docs/meeting-note-template.md)
