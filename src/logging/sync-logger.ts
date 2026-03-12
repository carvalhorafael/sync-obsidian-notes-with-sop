import type { App, PluginManifest } from "obsidian";

export class SyncLogger {
	private readonly logFilePath: string;

	constructor(
		private readonly app: App,
		manifest: PluginManifest,
	) {
		this.logFilePath = `${this.app.vault.configDir}/plugins/${manifest.id}/sync.log`;
	}

	async logError(message: string): Promise<void> {
		const adapter = this.app.vault.adapter;
		const entry = `[${new Date().toISOString()}] ${message}\n`;

		try {
			const existing = await adapter.read(this.logFilePath).catch(() => "");
			await adapter.write(this.logFilePath, `${existing}${entry}`);
		} catch (error) {
			console.error("Failed to write sync log", error);
		}
	}
}
