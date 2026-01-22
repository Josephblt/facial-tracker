import "../../styles/console.css";
import template from "../../templates/components/console-component.html?raw";
import type { LogEntry } from "../../dtos/log";
import { ConsoleService } from "../../services/consoleService";

export type ConsoleComponent = {
	element: HTMLElement;
	clear(): void;
};

type ConsoleElements = {
	element: HTMLElement;
	listEl: HTMLOListElement;
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

export function createConsoleComponent(service: ConsoleService): ConsoleComponent {
	const { element: root, listEl } = parseConsoleTemplate(template);
	const items = new Map<number, HTMLLIElement>();

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
		element: root,
		clear() {
			items.clear();
			listEl.replaceChildren();
		}
	};
}

const parseConsoleTemplate = (templateHtml: string): ConsoleElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement | null;
	const listEl = element.querySelector(".console__list") as HTMLOListElement | null;

	return { element, listEl };
};
