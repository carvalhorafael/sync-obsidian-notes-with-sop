import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, SopSyncSettingTab } from "./settings";
import { runSync } from "./sync/run-sync";
import type { PluginSettings } from "./types";

export default class SopMissionControlSyncPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("refresh-cw", "Sync notes to sop", () => {
			void this.handleSync();
		});

		this.addCommand({
			id: "sync-sop-meeting-notes",
			name: "Sync sop meeting notes",
			callback: () => {
				void this.handleSync();
			},
		});

		this.addSettingTab(new SopSyncSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async handleSync(): Promise<void> {
		try {
			await runSync(this.app, this.manifest, this.settings);
		} catch (error) {
			console.error("Unexpected sync failure", error);
			new Notice("Unexpected error during sop sync. Check the console for details.");
		}
	}
}
