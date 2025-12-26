const LEVELS = {
	info: { label: "INFO", priority: 1 },
	warn: { label: "WARN", priority: 2 },
	error: { label: "ERROR", priority: 3 }
};

export class GlobalConsole {
	constructor(options = {}) {
		this.maxEntries = options.maxEntries ?? 300;
		this.logs = [];
		this.isOpen = false;
		this.originalConsole = null;

		this.createUI();
		this.attachEvents();
		this.installConsoleProxy();
	}

	createUI() {
		this.root = document.createElement("div");
		this.root.className = "app-console";
		this.root.innerHTML = `
			<button class="console-launcher" aria-label="Open console">
				<span class="console-launcher__dot"></span>
				<svg class="console-launcher__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M3 6.5C3 5.67 3.67 5 4.5 5h15a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" fill="none" stroke="currentColor" stroke-width="1.4" />
					<path d="M6.75 9.25 9.5 12l-2.75 2.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M11.5 14.75h3.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
				</svg>
			</button>
			<div class="console-dialog console-dialog--hidden" role="dialog" aria-label="Console">
				<div class="console-dialog__header">
					<div class="console-dialog__title">Console</div>
					<button class="console-dialog__close" aria-label="Close console">×</button>
				</div>
				<div class="console-dialog__logs" role="log"></div>
			</div>
		`;
		document.body.appendChild(this.root);

		this.launcher = this.root.querySelector(".console-launcher");
		this.launcherDot = this.root.querySelector(".console-launcher__dot");
		this.dialog = this.root.querySelector(".console-dialog");
		this.logsContainer = this.root.querySelector(".console-dialog__logs");
		this.closeBtn = this.root.querySelector(".console-dialog__close");
		this.updateIndicator();
	}

	attachEvents() {
		this.launcher.addEventListener("click", () => this.open());
		this.closeBtn.addEventListener("click", () => this.close());
	}

	open() {
		if (this.isOpen) return;
		this.isOpen = true;
		this.dialog.classList.remove("console-dialog--hidden");
		this.launcher.classList.add("console-launcher--hidden");
		this.scrollToBottom();
	}

	close() {
		if (!this.isOpen) return;
		this.isOpen = false;
		this.dialog.classList.add("console-dialog--hidden");
		this.launcher.classList.remove("console-launcher--hidden");
	}

	addEntry(level, ...args) {
		const meta = LEVELS[level] ?? LEVELS.info;
		const time = new Date();
		const message = args
			.map(arg => this.stringifyArg(arg))
			.join(" ");

		const entry = {
			level,
			message,
			timestamp: time
		};

		this.logs.push(entry);
		if (this.logs.length > this.maxEntries) {
			this.logs.shift();
			if (this.logsContainer.firstChild) {
				this.logsContainer.removeChild(this.logsContainer.firstChild);
			}
		}

		const row = document.createElement("div");
		row.className = `console-log console-log--${level}`;

		const timeEl = document.createElement("span");
		timeEl.className = "console-log__time";
		timeEl.textContent = time.toLocaleTimeString();

		const levelEl = document.createElement("span");
		levelEl.className = "console-log__level";
		levelEl.textContent = meta.label;

		const msgEl = document.createElement("span");
		msgEl.className = "console-log__message";
		msgEl.textContent = message;

		row.appendChild(timeEl);
		row.appendChild(levelEl);
		row.appendChild(msgEl);
		this.logsContainer.appendChild(row);
		this.updateIndicator();
		this.scrollToBottom();
	}

	stringifyArg(value) {
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}

	scrollToBottom() {
		this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
	}

	updateIndicator() {
		const highest = this.logs.reduce((acc, log) => {
			const priority = LEVELS[log.level]?.priority ?? 0;
			return Math.max(acc, priority);
		}, 0);

		this.launcherDot.dataset.level = highest === 3 ? "error" : highest === 2 ? "warn" : highest === 1 ? "info" : "none";
	}

	installConsoleProxy() {
		if (this.originalConsole) return;
		this.originalConsole = {
			log: console.log,
			warn: console.warn,
			error: console.error,
			info: console.info
		};

		console.log = (...args) => {
			this.originalConsole.log(...args);
			this.addEntry("info", ...args);
		};

		console.info = (...args) => {
			this.originalConsole.info(...args);
			this.addEntry("info", ...args);
		};

		console.warn = (...args) => {
			this.originalConsole.warn(...args);
			this.addEntry("warn", ...args);
		};

		console.error = (...args) => {
			this.originalConsole.error(...args);
			this.addEntry("error", ...args);
		};
	}
}
