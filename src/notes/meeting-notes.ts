import { TFile, type App } from "obsidian";
import type {
	EligibleMeetingNote,
	NoteFrontmatter,
	SopDomain,
} from "../types";

export async function getEligibleMeetingNotes(
	app: App,
	syncFolder: string,
): Promise<{ notes: EligibleMeetingNote[]; skipped: Array<{ filePath: string; reason: string }> }> {
	const markdownFiles = app.vault.getMarkdownFiles().filter((file) =>
		shouldConsiderFile(file, syncFolder),
	);
	const notes: EligibleMeetingNote[] = [];
	const skipped: Array<{ filePath: string; reason: string }> = [];

	for (const file of markdownFiles) {
		const cache = app.metadataCache.getFileCache(file);
		const frontmatter = (cache?.frontmatter ?? {}) as NoteFrontmatter;

		if (frontmatter.sopSync !== true || frontmatter.sopType !== "meeting") {
			continue;
		}

		const noteId = ensureNoteId(frontmatter);
		if (!noteId) {
			skipped.push({ filePath: file.path, reason: "Missing noteId and could not generate one." });
			continue;
		}

		if (!isDomain(frontmatter.sopDomain)) {
			skipped.push({ filePath: file.path, reason: "Missing or invalid sopDomain." });
			continue;
		}

		if (!frontmatter.meetingDate || !isIsoDate(frontmatter.meetingDate)) {
			skipped.push({ filePath: file.path, reason: "Missing or invalid meetingDate." });
			continue;
		}

		const rawContent = await app.vault.read(file);
		const markdown = stripFrontmatter(rawContent).trim();
		if (!markdown) {
			skipped.push({ filePath: file.path, reason: "Note body is empty." });
			continue;
		}

		if (!frontmatter.noteId) {
			await persistNoteId(app, file, noteId);
		}

		notes.push({
			filePath: file.path,
			title: file.basename,
			domain: frontmatter.sopDomain,
			noteId,
			sopId: frontmatter.sopId,
			meetingDate: frontmatter.meetingDate,
			markdown,
		});
	}

	return { notes, skipped };
}

export async function updateSyncMetadata(
	app: App,
	filePath: string,
	metadata: {
		sopId?: string;
		lastSyncStatus: "success" | "error";
		lastSyncedAt?: string;
	},
): Promise<void> {
	const file = app.vault.getAbstractFileByPath(filePath);
	if (!(file instanceof TFile)) {
		return;
	}

	await app.fileManager.processFrontMatter(file, (frontmatter) => {
		const mutableFrontmatter = frontmatter as NoteFrontmatter & Record<string, unknown>;
		if (metadata.sopId) {
			mutableFrontmatter.sopId = metadata.sopId;
		}
		mutableFrontmatter.lastSyncStatus = metadata.lastSyncStatus;
		if (metadata.lastSyncedAt) {
			mutableFrontmatter.lastSyncedAt = metadata.lastSyncedAt;
		}
	});
}

function shouldConsiderFile(file: TFile, syncFolder: string): boolean {
	if (!syncFolder) {
		return true;
	}
	return file.path === syncFolder || file.path.startsWith(`${syncFolder}/`);
}

function ensureNoteId(frontmatter: NoteFrontmatter): string {
	return frontmatter.noteId?.trim() || createNoteId();
}

function createNoteId(): string {
	const now = new Date();
	const parts = [
		now.getFullYear(),
		pad(now.getMonth() + 1),
		pad(now.getDate()),
		pad(now.getHours()),
		pad(now.getMinutes()),
		pad(now.getSeconds()),
	].join("");
	const suffix = Math.random().toString(36).slice(2, 6);
	return `${parts}-${suffix}`;
}

function pad(value: number): string {
	return value.toString().padStart(2, "0");
}

function isDomain(value: string | undefined): value is SopDomain {
	return value === "executive" || value === "creator";
}

function isIsoDate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function stripFrontmatter(content: string): string {
	return content.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

async function persistNoteId(app: App, file: TFile, noteId: string): Promise<void> {
	await app.fileManager.processFrontMatter(file, (frontmatter) => {
		const mutableFrontmatter = frontmatter as NoteFrontmatter & Record<string, unknown>;
		mutableFrontmatter.noteId = noteId;
	});
}
