import { Notice, type App, type PluginManifest } from "obsidian";
import { SopSyncApiClient } from "../api/sop-client";
import { SyncLogger } from "../logging/sync-logger";
import {
	getEligibleMeetingNotes,
	updateSyncMetadata,
} from "../notes/meeting-notes";
import type { PluginSettings, SyncOutcome, SyncPayload } from "../types";
import { SyncReportModal } from "../ui/sync-report-modal";

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
	await logger.logInfo(
		`Sync started | syncFolder=${settings.syncFolder || "<all>"} | endpoint=${settings.apiBaseUrl}`,
	);
	const { scannedCount, notes, skipped } = await getEligibleMeetingNotes(
		app,
		settings.syncFolder,
	);
	await logger.logInfo(
		`Discovery finished | scanned=${scannedCount} | eligible=${notes.length} | skipped=${skipped.length}`,
	);

	for (const skippedNote of skipped) {
		await logger.logInfo(
			`Skipped note | filePath=${skippedNote.filePath} | reason=${skippedNote.reason}`,
		);
	}

	const outcomes: SyncOutcome[] = skipped.map((item) => ({
		filePath: item.filePath,
		ok: false,
		kind: "skipped",
		reason: item.reason,
	}));

	for (const note of notes) {
		await logger.logInfo(
			`Syncing note | filePath=${note.filePath} | noteId=${note.noteId} | sopId=${note.sopId ?? "<none>"} | meetingDate=${note.meetingDate} | markdownLength=${note.markdown.length}`,
		);

		const payload: SyncPayload = {
			source: "obsidian",
			noteType: "meeting",
			domain: note.domain,
			externalId: note.noteId,
			title: note.title,
			meetingDate: note.meetingDate,
			markdown: note.markdown,
			obsidian: {
				filePath: note.filePath,
			},
		};
		if (note.sopId) {
			payload.remoteId = note.sopId;
		}

		try {
			const result = await client.syncMeetingNote(payload);
			await logger.logInfo(
				`Sync success | filePath=${note.filePath} | noteId=${note.noteId} | action=${result.action} | sopId=${result.sopId}`,
			);
			await updateSyncMetadata(app, note.filePath, {
				sopId: result.sopId,
				lastSyncStatus: "success",
				lastSyncedAt: new Date().toISOString(),
			});
			await logger.logInfo(
				`Metadata updated | filePath=${note.filePath} | lastSyncStatus=success`,
			);
			outcomes.push({
				filePath: note.filePath,
				ok: true,
				kind: "success",
				created: result.action === "created",
			});
		} catch (error) {
			const reason = error instanceof Error ? error.message : "Unknown sync error.";
			await updateSyncMetadata(app, note.filePath, {
				lastSyncStatus: "error",
			});
			await logger.logError(
				`Sync failed | filePath=${note.filePath} | noteId=${note.noteId} | reason=${reason}`,
			);
			await logger.logInfo(
				`Metadata updated | filePath=${note.filePath} | lastSyncStatus=error`,
			);
			outcomes.push({
				filePath: note.filePath,
				ok: false,
				kind: "failed",
				reason,
			});
		}
	}

	const successCount = outcomes.filter((item) => item.kind === "success").length;
	const failedCount = outcomes.filter((item) => item.kind === "failed").length;
	const skippedCount = outcomes.filter((item) => item.kind === "skipped").length;
	await logger.logInfo(
		`Sync finished | success=${successCount} | failed=${failedCount} | skipped=${skippedCount}`,
	);
	new Notice(`Sync finished: ${successCount} succeeded, ${failedCount} failed, ${skippedCount} skipped.`, 7000);

	if (failedCount > 0 || skippedCount > 0) {
		new Notice("Open the sync report for details.", 5000);
		new SyncReportModal(app, outcomes).open();
	}
}
