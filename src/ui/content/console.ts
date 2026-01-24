import "../../styles/content/console.css";
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

	listEl.addEventListener("click", (e) => {
		const item = (e.target as HTMLElement).closest<HTMLLIElement>(".console__item");
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

	const addLog = (log: LogEntry) => {
		const item = createLogItem(log);
		items.set(log.id, item);
		listEl.appendChild(item);
	};

	const updateLog = (log: LogEntry) => {
		const item = items.get(log.id);
		if (!item) return;
		item.classList.toggle("console__item--unread", !log.read);
	};

	service.onLogChanged((event) => {
		if (event.type === "add") {
			addLog(event.log);
			return;
		}

		updateLog(event.log);
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
	const item = document.createElement("li");
	item.className = `console__item console__item--${log.level}`;
	item.dataset.logId = String(log.id);
	item.classList.toggle("console__item--unread", !log.read);

	const time = document.createElement("span");
	time.className = "console__time";
	time.textContent = formatTimestamp(log.timestamp);
	const timeTitle = formatTimestampTitle(log.timestamp);
	if (timeTitle) {
		time.title = timeTitle;
	}

	const level = document.createElement("span");
	level.className = "console__level";
	level.textContent = log.level;

	const message = document.createElement("span");
	message.className = "console__message";
	message.textContent = log.message;

	item.append(time, level, message);
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
