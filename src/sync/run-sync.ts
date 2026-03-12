import { Notice, type App, type PluginManifest } from "obsidian";
import { SopSyncApiClient } from "../api/sop-client";
import { SyncLogger } from "../logging/sync-logger";
import {
	getEligibleMeetingNotes,
	updateSyncMetadata,
} from "../notes/meeting-notes";
import type { PluginSettings, SyncOutcome, SyncPayload } from "../types";

export async function runSync(
	app: App,
	manifest: PluginManifest,
	settings: PluginSettings,
): Promise<void> {
	if (!settings.apiBaseUrl || !settings.apiToken) {
		new Notice("Set the sync endpoint and token before running sync.");
		return;
	}

	const client = new SopSyncApiClient(
		settings.apiBaseUrl,
		settings.apiToken,
		settings.requestTimeoutMs,
	);
	const logger = new SyncLogger(app, manifest);
	const { notes, skipped } = await getEligibleMeetingNotes(app, settings.syncFolder);
	const outcomes: SyncOutcome[] = skipped.map((item) => ({
		filePath: item.filePath,
		ok: false,
		reason: item.reason,
	}));

	for (const note of notes) {
		const payload: SyncPayload = {
			source: "obsidian",
			noteType: "meeting",
			domain: note.domain,
			externalId: note.noteId,
			remoteId: note.sopId,
			title: note.title,
			meetingDate: note.meetingDate,
			markdown: note.markdown,
			obsidian: {
				filePath: note.filePath,
			},
		};

		try {
			const result = await client.syncMeetingNote(payload);
			await updateSyncMetadata(app, note.filePath, {
				sopId: result.sopId,
				lastSyncStatus: "success",
				lastSyncedAt: new Date().toISOString(),
			});
			outcomes.push({
				filePath: note.filePath,
				ok: true,
				created: result.action === "created",
			});
		} catch (error) {
			const reason = error instanceof Error ? error.message : "Unknown sync error.";
			await updateSyncMetadata(app, note.filePath, {
				lastSyncStatus: "error",
			});
			await logger.logError(`${note.filePath} | ${note.noteId} | ${reason}`);
			outcomes.push({
				filePath: note.filePath,
				ok: false,
				reason,
			});
		}
	}

	const successCount = outcomes.filter((item) => item.ok).length;
	const failureCount = outcomes.length - successCount;
	new Notice(
		`SOP sync finished. Success: ${successCount}. Failed or skipped: ${failureCount}.`,
		7000,
	);
}
