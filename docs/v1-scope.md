# V1 scope

## Goal

Deliver a first usable version of the plugin that allows Rafael to manually synchronize meeting notes from Obsidian to SOP Mission Control.

## Agreed scope

V1 will include:

- plugin settings for SOP API base URL
- plugin settings for sync token
- plugin settings for optional sync folder restriction
- plugin settings for basic network behavior such as timeout
- a manual sync action exposed through the Obsidian UI
- detection of notes explicitly marked for synchronization
- support for one synchronized note type first: `meeting`
- extraction of structured note data from frontmatter and markdown content
- outbound sync from Obsidian to SOP only
- persistence of sync metadata back into the note after successful sync
- visible reporting of sync results inside Obsidian

## Out of scope

V1 will not include:

- bidirectional sync
- periodic background sync
- sync on startup or shutdown
- multiple note types in the first release
- conflict resolution between local and remote edits
- broad natural-language parsing of arbitrary notes
- silent sync without user action

## Working assumptions

### Note eligibility

A note will only be considered for sync when it is explicitly marked in frontmatter.

Recommended markers:

```yaml
---
sopSync: true
sopType: meeting
---
```

### Structured meeting note approach

The current preferred format is:

- frontmatter for flags and stable metadata
- markdown sections for the content the user writes naturally

Example sections that are expected for meeting notes:

- `Objective`
- `Participants`
- `Decisions`
- `Tasks`

The final field set is still pending, but likely required fields include:

- objective
- participants
- decisions

Potential optional fields include:

- date
- context
- tasks
- notes body

### Sync identity

The plugin should support idempotent sync behavior.

Current recommended direction:

- create a remote record when the note has no `sopId`
- update the existing remote record when `sopId` is already present
- write metadata such as `sopId`, `lastSyncedAt`, and `lastSyncStatus` back to frontmatter

### Sync execution model

Current recommended direction:

- scan the whole vault or an optionally configured folder
- process eligible notes one by one
- continue processing even if some notes fail
- present a final summary with counts for success and failure

## Open decisions

The following decisions still need to be finalized before implementation:

- exact meeting note schema
- exact markdown section names and parsing rules
- exact API payload shape expected by SOP
- whether requests are sent one note at a time or in batches
- how to represent sync errors in frontmatter, if at all
- whether the plugin should create a command only, or both a command and a ribbon icon in V1

## Recommended implementation direction

To keep the codebase maintainable, the plugin should move away from the sample-plugin shape and toward a modular structure such as:

```text
src/
  main.ts
  settings.ts
  commands/
  sync/
  notes/
  api/
  ui/
  types.ts
```

Recommended responsibilities:

- `main.ts`: lifecycle only
- `settings.ts`: settings model, defaults, settings tab
- `commands/`: manual sync command registration
- `notes/`: note discovery, frontmatter parsing, meeting note parsing
- `api/`: SOP HTTP client
- `sync/`: orchestration and result reporting
- `ui/`: notices, modals, or future sync status views
