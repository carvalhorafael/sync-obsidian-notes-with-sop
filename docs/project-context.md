# Project context

## What this project is

This repository is an Obsidian community plugin whose purpose is to synchronize selected Obsidian notes with SOP Mission Control.

The plugin is being built on top of the official Obsidian sample plugin scaffold, but the end goal is a production plugin with a clear, narrow workflow around structured note synchronization.

## What SOP Mission Control is

SOP Mission Control is Rafael's personal operating system for running two business fronts inside one application:

- `Executive`: operation of Quest Edu, with emphasis on decisions, meetings, tasks, and weekly review
- `Creator`: content production and distribution for Rafael's personal brand

The broader product objective is to:

- reduce context switching
- create durable strategic memory
- maintain a clear weekly execution rhythm
- preserve a human-in-the-loop operating model before introducing heavier automation

## Current state of the SOP application

The SOP application already has its core operating base in place, including:

- authentication
- route protection
- database entities for the main operational objects
- main cockpit
- dual inbox for executive and creator
- week management
- weekly focus
- decisions
- meetings
- tasks
- weekly review
- separate navigation areas such as `/cockpit`, `/inbox`, `/executive`, `/creator`, `/week`, and `/settings`

## Why an Obsidian plugin exists in this system

Obsidian is intended to act as a note-taking and reflection environment, especially for structured operational notes such as meetings.

The plugin will bridge the gap between local notes and the SOP application by:

- identifying notes that should be synchronized
- extracting structured information from them
- sending that information to the SOP API
- persisting sync metadata locally in the note

This avoids manual copy/paste and allows notes to remain the source workspace while Mission Control remains the system of record for operational workflows.

## Product principles for this plugin

- Start narrow and reliable rather than broad and clever.
- Prefer explicit note markers over inference.
- Prefer manual sync before background automation.
- Keep the user in control of what is synced.
- Make sync behavior visible and debuggable.
- Keep the plugin lightweight during Obsidian startup.
- Respect Obsidian plugin safety expectations and local-first behavior.
