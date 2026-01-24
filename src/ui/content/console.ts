import "../../styles/content/console.css";
import "../../styles/content/log.css";
import logTemplate from "../../templates/content/log.html?raw";
import type { LogEntry } from "../../services/dtos/log";
import { ConsoleService } from "../../services/consoleService";

export type ConsoleContent = {
	element: HTMLElement;
	clear(): void;
};

export function createConsoleContent(service: ConsoleService): ConsoleContent {
	const element = document.createElement("div");
	element.className = "console";
	element.setAttribute("role", "log");
	element.setAttribute("aria-live", "polite");

	const listEl = document.createElement("ol");
	listEl.className = "console__list";
	element.appendChild(listEl);

	const items = new Map<number, HTMLLIElement>();

	const addLog = (log: LogEntry) => {
		const item = createLogItem(log);
		items.set(log.id, item);
		listEl.appendChild(item);
	};

	const updateLog = (log: LogEntry) => {
		const item = items.get(log.id);
		if (!item) return;
		item.classList.toggle("log--unread", !log.read);
	};

	service.onLogChanged((event) => {
		if (event.type === "add") {
			addLog(event.log);
			return;
		}

		updateLog(event.log);
	});

	listEl.addEventListener("click", (e) => {
		const item = (e.target as HTMLElement).closest<HTMLLIElement>(".log");
		if (!item) return;

		const logId = Number(item.dataset.logId);
		const log = service.getLogs().find(l => l.id === logId);
		if (!log) return;

		if (log.read) {
			service.markUnread(logId);
		} else {
			service.markRead(logId);
		}
	});

	for (const log of service.getLogs()) {
		addLog(log);
	}

	return {
		element,
		clear() {
			items.clear();
			listEl.replaceChildren();
		}
	};
}

const createLogItem = (log: LogEntry): HTMLLIElement => {
	const template = document.createElement("template");
	template.innerHTML = logTemplate.trim();

	const item = template.content.firstElementChild as HTMLLIElement;
	item.classList.add(`log--${log.level}`);
	item.dataset.logId = String(log.id);
	item.classList.toggle("log--unread", !log.read);

	const time = item.querySelector(".log__time") as HTMLElement;
	time.textContent = formatTimestamp(log.timestamp);
	const timeTitle = formatTimestampTitle(log.timestamp);
	if (timeTitle) {
		time.title = timeTitle;
	}

	const level = item.querySelector(".log__level") as HTMLElement;
	level.textContent = log.level;

	const message = item.querySelector(".log__message") as HTMLElement;
	message.textContent = log.message;

	return item;
};

const formatTimestamp = (timestamp: Date | string): string => {
	const value = timestamp instanceof Date ? timestamp : new Date(timestamp);
	if (Number.isNaN(value.getTime())) {
		return "";
	}

	return value.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
};

const formatTimestampTitle = (timestamp: Date | string): string => {
	const value = timestamp instanceof Date ? timestamp : new Date(timestamp);
	if (Number.isNaN(value.getTime())) {
		return "";
	}

	return value.toLocaleString();
};
