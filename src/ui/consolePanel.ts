import consoleIcon from "../assets/icons/console-icon.svg?raw";
import type { ConsoleService } from "../services/consoleService";
import type { LogEvent, LogEntry, LogLevel } from "../dto/log";

export class ConsolePanel {
	private service: ConsoleService;
	private isOpen: boolean;
	private rows: Map<number, HTMLDivElement>;
	private root: HTMLDivElement;
	private launcher: HTMLButtonElement;
	private dialog: HTMLDivElement;
	private logsContainer: HTMLDivElement;
	private closeBtn: HTMLButtonElement;
	private badges: {
		info: HTMLElement | null;
		warn: HTMLElement | null;
		error: HTMLElement | null;
	};

	constructor(service: ConsoleService) {
		this.service = service;
		this.isOpen = false;
		this.rows = new Map();

		this.root = document.createElement("div");
		this.root.className = "utility-dock";
		this.root.innerHTML = `
			<button class="utility-launcher ui-button" aria-label="Open console">
				<div class="utility-launcher__badges">
					<span class="utility-launcher__badge ui-button utility-launcher__badge--info"></span>
					<span class="utility-launcher__badge ui-button utility-launcher__badge--warn"></span>
					<span class="utility-launcher__badge ui-button utility-launcher__badge--error"></span>
				</div>
				<span class="utility-launcher__icon" aria-hidden="true">${consoleIcon}</span>
			</button>
			<div class="utility-dialog utility-dialog--hidden" role="dialog" aria-label="Console">
				<div class="utility-dialog__header">
					<div class="utility-dialog__title">Console</div>
					<button class="utility-dialog__close ui-button" aria-label="Close console">×</button>
				</div>
				<div class="utility-dialog__logs" role="log"></div>
			</div>
		`;
		document.body.appendChild(this.root);

		this.launcher = this.root.querySelector(".utility-launcher") as HTMLButtonElement;
		this.dialog = this.root.querySelector(".utility-dialog") as HTMLDivElement;
		this.logsContainer = this.root.querySelector(".utility-dialog__logs") as HTMLDivElement;
		this.closeBtn = this.root.querySelector(".utility-dialog__close") as HTMLButtonElement;
		this.badges = {
			info: this.root.querySelector(".utility-launcher__badge--info"),
			warn: this.root.querySelector(".utility-launcher__badge--warn"),
			error: this.root.querySelector(".utility-launcher__badge--error")
		};
		this.launcher.title = "Open console";

		this.launcher.addEventListener("click", () => this.open());
		this.closeBtn.addEventListener("click", () => this.close());
		this.service.onLogChanged(event => this.handleOnLogChanged(event));
	}

	private open() {
		if (this.isOpen) return;
		this.isOpen = true;
		this.dialog.classList.remove("utility-dialog--hidden");
		this.launcher.classList.add("utility-launcher--hidden");
	}

	private close() {
		if (!this.isOpen) return;
		this.isOpen = false;
		this.dialog.classList.add("utility-dialog--hidden");
		this.launcher.classList.remove("utility-launcher--hidden");
	}

	private addLog(log: LogEntry) {
		if (this.rows.has(log.id)) {
			this.updateLog(log);
			return;
		}

		const row = document.createElement("div");
		row.className = `console-log console-log--${log.level}`;
		row.dataset.id = String(log.id);

		const timeEl = document.createElement("span");
		timeEl.className = "console-log__time";
		timeEl.textContent = log.timestamp.toLocaleTimeString();

		const levelEl = document.createElement("span");
		levelEl.className = "console-log__level";
		levelEl.textContent = log.level.toUpperCase();

		const msgEl = document.createElement("span");
		msgEl.className = "console-log__message";
		msgEl.textContent = log.message;

		row.appendChild(timeEl);
		row.appendChild(levelEl);
		row.appendChild(msgEl);
		this.logsContainer.appendChild(row);
		this.rows.set(log.id, row);

		this.updateLog(log);
	}

	private updateLog(log: LogEntry) {
		const row = this.rows.get(log.id);
		if (!row) return;

		if (log.read) {
			row.classList.remove("console-log--unread");
		} else {
			row.classList.add("console-log--unread");
		}
	}

	private updateBadge(badge: HTMLElement | null, count: number, level: LogLevel) {
		if (!badge) return;

		let badgeHoverText = `No unread ${level} logs.`;
		if (count > 0) {
			let plural = "s";
			if (count === 1) {
				plural = "";
			}
			badgeHoverText = `${count} unread ${level} log${plural}.`;
		}
		badge.title = badgeHoverText;
		
		if (count > 0) {
			badge.textContent = String(count);
			badge.classList.remove("is-hidden");
		} else {
			badge.textContent = "";
			badge.classList.add("is-hidden");
		}
	}

	private handleOnLogChanged(event: LogEvent) {
		const { type, log, counts } = event;
		switch (type) {
			case "add":
				this.addLog(log);
				break;
			case "update":
				this.updateLog(log);
				break;
		}

		this.updateBadge(this.badges.info, counts.info, "info");
		this.updateBadge(this.badges.warn, counts.warn, "warn");
		this.updateBadge(this.badges.error, counts.error, "error");
	}
}
