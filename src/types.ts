export type SopDomain = "executive" | "creator";

export interface PluginSettings {
	apiBaseUrl: string;
	apiToken: string;
	syncFolder: string;
	requestTimeoutMs: number;
}

export interface NoteFrontmatter {
	sopSync?: boolean;
	sopType?: string;
	sopDomain?: SopDomain;
	noteId?: string;
	sopId?: string;
	meetingDate?: string;
	lastSyncedAt?: string;
	lastSyncStatus?: "success" | "error";
}

export interface SyncPayload {
	source: "obsidian";
	noteType: "meeting";
	domain: SopDomain;
	externalId: string;
	remoteId?: string;
	title: string;
	meetingDate: string;
	markdown: string;
	obsidian?: {
		filePath: string;
	};
}

export interface SyncSuccessResponse {
	ok: true;
	action: "created" | "updated";
	sopId: string;
	externalId: string;
}

export interface SyncErrorResponse {
	ok: false;
	error: {
		code: string;
		message: string;
	};
}

export interface EligibleMeetingNote {
	filePath: string;
	title: string;
	domain: SopDomain;
	noteId: string;
	sopId?: string;
	meetingDate: string;
	markdown: string;
}

export interface SyncOutcome {
	filePath: string;
	ok: boolean;
	reason?: string;
	created?: boolean;
}
