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
- support for note domain metadata with values such as `executive` and `creator`
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
- note creation
- template management

## Working assumptions

### Note eligibility

A note will only be considered for sync when it is explicitly marked in frontmatter.

Recommended markers:

```yaml
---
sopSync: true
sopType: meeting
sopDomain: executive
noteId: 20260312104530-a7k2
---
```

Required note-level metadata for V1:

- `sopSync: true`
- `sopType: meeting`
- `sopDomain: executive | creator`
- `noteId`

### Structured meeting note approach

The current preferred format is:

- frontmatter for flags and stable metadata
- markdown for the note content the user writes naturally

Example sections that are expected for meeting notes, with English and Portuguese aliases:

- `Objective` or `Objetivo`
- `Participants` or `Participantes`
- `Decisions` or `Decisões`
- `Tasks` or `Tarefas`
- `Notes` or `Notas`

For V1, the plugin does not need to break these sections into separate API fields. The main note body can be sent as markdown, which keeps the plugin simpler and more compatible with future note types.

### Sync identity

The plugin should support idempotent sync behavior.

Current recommended direction:

- use `noteId` stored in frontmatter as the stable local identifier
- send `noteId` to the SOP API as `externalId`
- create a remote record when the note has no `sopId`
- update the existing remote record when `sopId` is already present
- write metadata such as `sopId`, `lastSyncedAt`, and `lastSyncStatus` back to frontmatter

The plugin should not use file path as the primary identity for sync. File path can still be sent as auxiliary metadata in the payload.

Recommended `noteId` shape:

- timestamp-based identifier with second precision plus a short random suffix
- example: `20260312104530-a7k2`

This identifier should be created once and remain stable for the life of the note.

### Sync execution model

Current recommended direction:

- scan the whole vault or an optionally configured folder
- process eligible notes one by one
- continue processing even if some notes fail
- present a final summary with counts for success and failure

## Meeting note specification draft

Recommended frontmatter example:

```yaml
---
sopSync: true
sopType: meeting
sopDomain: executive
noteId: 20260312104530-a7k2
sopId:
meetingDate: 2026-03-12
lastSyncedAt:
lastSyncStatus:
---
```

Recommended note body example:

```md
# Reunião semanal Quest

## Objetivo
Definir prioridades da semana e destravar pendências de operação.

## Participantes
- Rafael
- Ana
- João

## Decisões
- Priorizar revisão do funil comercial
- Adiar contratação até abril

## Tarefas
- [ ] Rafael: revisar métricas até sexta
- [ ] Ana: consolidar pauta da próxima reunião

## Notas
Observações livres da reunião.
```

Recommended required content for sync:

- note title
- `meetingDate`
- `sopDomain`
- note body markdown

Recommended optional content:

- `Tasks` or `Tarefas`
- `Notes` or `Notas`

## Endpoint contract draft

The plugin should send one `POST` request per note to the configured sync URL.

### Request

Method:

```text
POST
```

URL:

- provided by the user in plugin settings

Headers:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Recommended request payload:

```json
{
  "source": "obsidian",
  "noteType": "meeting",
  "domain": "executive",
  "externalId": "20260312104530-a7k2",
  "remoteId": "existing-sop-id-or-null",
  "title": "Reunião semanal Quest",
  "meetingDate": "2026-03-12",
  "markdown": "# Reunião semanal Quest\n\n## Objetivo\nDefinir prioridades da semana e destravar pendências de operação.\n\n## Participantes\n- Rafael\n- Ana\n- João\n\n## Decisões\n- Priorizar revisão do funil comercial\n- Adiar contratação até abril\n\n## Tarefas\n- [ ] Rafael: revisar métricas até sexta\n- [ ] Ana: consolidar pauta da próxima reunião\n\n## Notas\nObservações livres da reunião.\n",
  "obsidian": {
    "filePath": "Meetings/2026-03-12-reuniao-semanal-quest.md"
  }
}
```

### Required request fields

- `source`
- `noteType`
- `domain`
- `externalId`
- `title`
- `meetingDate`
- `markdown`

### Optional request fields

- `remoteId`
- `obsidian.filePath`

### Validation rules

- `domain` is required
- `meetingDate` is required
- `externalId` is required and should be stable
- `markdown` is the primary note content field
- `participants`, `decisions`, and `tasks` do not need dedicated top-level fields in V1

### Upsert behavior

- use a single upsert-style endpoint for V1
- match records by `externalId`
- if a matching record exists, overwrite the stored content
- if no matching record exists, create a new record
- `remoteId` can be sent as auxiliary context but should not be the primary match key
- return the remote record identifier so the plugin can persist `sopId`

### Success response

Recommended success response:

```json
{
  "ok": true,
  "action": "created",
  "sopId": "mtg_123",
  "externalId": "20260312104530-a7k2"
}
```

`action` can be:

- `created`
- `updated`

### Error response

Recommended error response:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "meetingDate is required"
  }
}
```

Rationale for one note per request in V1:

- simpler retry behavior
- easier per-note error reporting
- clearer idempotency semantics
- lower coupling between plugin orchestration and server-side batch behavior

Batch sync can be added later if throughput becomes a real concern.

## Open decisions

The following decisions still need to be finalized before implementation:

- whether sync error details should also be mirrored into frontmatter, or only written to local logs and UI feedback

## Error logging

Current agreed direction:

- sync errors should be written to a local log file inside the plugin data area
- UI should still present a concise summary after each run
- frontmatter should keep lightweight sync status fields such as `lastSyncStatus` without storing verbose error traces by default

Recommended log design for V1:

- one plugin-owned log file, such as `sync.log`
- append structured entries with timestamp, note path, `noteId`, and error summary
- keep the log human-readable first, structured second

## Sync UI

Current agreed direction:

- expose a command to run sync
- expose a ribbon icon that triggers the same sync flow
- keep both entry points mapped to the same orchestration logic
- do not create notes from the plugin
- treat note templates as external artifacts owned by the user workflow, not by plugin code

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
