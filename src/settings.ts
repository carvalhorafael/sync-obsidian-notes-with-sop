import { App, PluginSettingTab, Setting } from "obsidian";
import type SopMissionControlSyncPlugin from "./main";
import type { PluginSettings } from "./types";

export const DEFAULT_SETTINGS: PluginSettings = {
	apiBaseUrl: "",
	apiToken: "",
	syncFolder: "",
	requestTimeoutMs: 15000,
};

export class SopSyncSettingTab extends PluginSettingTab {
	plugin: SopMissionControlSyncPlugin;

	constructor(app: App, plugin: SopMissionControlSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Sync endpoint")
			.setDesc("Set the full sync endpoint URL used for note upserts.")
			.addText((text) =>
				text
					.setPlaceholder("https://your-sop.app/api/obsidian/sync")
					.setValue(this.plugin.settings.apiBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiBaseUrl = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Sync token")
			.setDesc("Set the bearer token used to authenticate sync requests.")
			.addText((text) =>
				text
					.setPlaceholder("Paste your API token")
					.setValue(this.plugin.settings.apiToken)
					.onChange(async (value) => {
						this.plugin.settings.apiToken = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Sync folder")
			.setDesc("Optionally limit sync to a single folder inside the vault.")
			.addText((text) =>
				text
					.setPlaceholder("Meetings")
					.setValue(this.plugin.settings.syncFolder)
					.onChange(async (value) => {
						this.plugin.settings.syncFolder = normalizeFolder(value);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Request timeout")
			.setDesc("Set the timeout in milliseconds for each sync request.")
			.addText((text) =>
				text
					.setPlaceholder("15000")
					.setValue(String(this.plugin.settings.requestTimeoutMs))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value.trim(), 10);
						if (Number.isFinite(parsed) && parsed > 0) {
							this.plugin.settings.requestTimeoutMs = parsed;
							await this.plugin.saveSettings();
						}
					}),
			);
	}
}

function normalizeFolder(value: string): string {
	return value.trim().replace(/^\/+|\/+$/g, "");
}
