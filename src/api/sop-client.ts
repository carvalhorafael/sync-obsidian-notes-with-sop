import { requestUrl } from "obsidian";
import type {
	SyncErrorResponse,
	SyncPayload,
	SyncSuccessResponse,
} from "../types";

export class SopSyncApiClient {
	constructor(
		private readonly apiBaseUrl: string,
		private readonly apiToken: string,
		private readonly requestTimeoutMs: number,
	) {}

	async syncMeetingNote(
		payload: SyncPayload,
	): Promise<SyncSuccessResponse> {
		const response = await Promise.race([
			requestUrl({
				url: this.apiBaseUrl,
				method: "POST",
				contentType: "application/json",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
				},
				body: JSON.stringify(payload),
				throw: false,
			}),
			createTimeout(this.requestTimeoutMs),
		]);

		const data = response.json as SyncSuccessResponse | SyncErrorResponse | undefined;
		if (response.status >= 200 && response.status < 300 && data?.ok === true) {
			return data;
		}

		const code = data && "error" in data ? data.error.code : `HTTP_${response.status}`;
		const message =
			data && "error" in data
				? data.error.message
				: `Request failed with status ${response.status}`;

		throw new Error(`${code}: ${message}`);
	}
}

function createTimeout(timeoutMs: number): Promise<never> {
	return new Promise((_, reject) => {
		window.setTimeout(() => {
			reject(new Error(`TIMEOUT: Request exceeded ${timeoutMs}ms`));
		}, timeoutMs);
	});
}
