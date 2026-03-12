# SOP Mission Control Sync for Obsidian

Obsidian community plugin that syncs structured notes from an Obsidian vault to Rafael's SOP Mission Control application.

## Project status

This repository started from the official Obsidian sample plugin and is currently in the transition from scaffold to product.

The current codebase still contains sample behavior from the base template. The product definition and scope for the real plugin are now documented in `docs/`.

## Product intent

SOP Mission Control is Rafael's personal operating system for running two business fronts in one application:

- `Executive`: Quest Edu operations, decisions, meetings, tasks, and weekly review.
- `Creator`: content production and distribution for Rafael's personal brand.

The plugin exists to make Obsidian a structured capture and reflection surface that can push relevant notes into Mission Control without forcing manual copy/paste.

This plugin is intentionally scoped to synchronization only. It does not create notes, manage templates, or own the authoring workflow inside Obsidian.

## V1 scope

The first version is intentionally narrow:

- sync only from `Obsidian -> SOP`
- sync only notes explicitly marked for synchronization
- support one note type first: `meeting`
- include note domain metadata such as `executive` and `creator`
- provide manual sync from the Obsidian UI
- expose both a command and a ribbon icon for manual sync
- provide plugin settings for API base URL, sync token, and basic sync options
- send structured note payloads to the SOP API
- write sync metadata back to the note frontmatter after successful sync

Out of scope for V1:

- bidirectional sync
- automatic background sync
- support for multiple note types from day one
- conflict resolution between local and remote edits
- aggressive text inference from free-form notes
- note creation or template management inside the plugin

## Proposed note model for V1

Notes eligible for sync should use frontmatter markers such as:

```yaml
---
sopSync: true
sopType: meeting
sopDomain: executive
noteId: 20260312104530-a7k2
---
```

The agreed direction for the meeting note model is:

- frontmatter for note identity and stable metadata
- markdown as the primary content body sent to the SOP
- optional section structure for human-friendly authoring, including objective, participants, decisions, and tasks
- support section titles in either English or Portuguese
- use `noteId` from frontmatter as the stable `externalId` sent to SOP

The agreed direction for execution is:

- send one note per request in V1
- log sync failures locally in the plugin data area

## Repository structure

Current relevant files:

- `src/main.ts`: current Obsidian plugin entrypoint from the sample template
- `src/settings.ts`: current sample settings tab
- `manifest.json`: plugin manifest, still using sample values
- `docs/project-context.md`: business and product context
- `docs/v1-scope.md`: agreed initial scope and architecture direction
- `AGENTS.md`: working instructions plus persistent project context for future sessions

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

## Manual testing in Obsidian

Copy the release artifacts to:

```bash
<Vault>/.obsidian/plugins/<plugin-id>/
```

Required files:

- `main.js`
- `manifest.json`
- `styles.css` if used

Then reload Obsidian and enable the plugin in **Settings -> Community plugins**.

## Documentation

- [`docs/project-context.md`](docs/project-context.md)
- [`docs/v1-scope.md`](docs/v1-scope.md)
- [`docs/meeting-note-template.md`](docs/meeting-note-template.md)
