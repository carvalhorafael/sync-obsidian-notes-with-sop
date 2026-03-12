import { Modal, Setting, type App } from "obsidian";
import type { SyncOutcome } from "../types";

export class SyncReportModal extends Modal {
	constructor(
		app: App,
		private readonly outcomes: SyncOutcome[],
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Sync report" });

		const successful = this.outcomes.filter((item) => item.ok);
		const failed = this.outcomes.filter((item) => !item.ok && item.kind === "failed");
		const skipped = this.outcomes.filter((item) => !item.ok && item.kind === "skipped");

		new Setting(contentEl)
			.setName("Summary")
			.setDesc(
				`${successful.length} succeeded, ${failed.length} failed, ${skipped.length} skipped.`,
			);

		if (failed.length > 0) {
			contentEl.createEl("h3", { text: "Failed" });
			renderOutcomeList(contentEl, failed);
		}

		if (skipped.length > 0) {
			contentEl.createEl("h3", { text: "Skipped" });
			renderOutcomeList(contentEl, skipped);
		}
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

function renderOutcomeList(containerEl: HTMLElement, outcomes: SyncOutcome[]): void {
	const list = containerEl.createEl("ul");

	for (const outcome of outcomes) {
		const item = list.createEl("li");
		item.createEl("strong", { text: outcome.filePath });
		if (outcome.reason) {
			item.createSpan({ text: `: ${outcome.reason}` });
		}
	}
}
