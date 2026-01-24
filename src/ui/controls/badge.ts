import "../../styles/controls/badge.css";
import template from "../../templates/controls/badge.html?raw";
import type { UnreadCounts } from "../../services/dtos/log";

export type Badge = {
	element: HTMLElement;
	update(counts: UnreadCounts): void;
};

export function createBadge(): Badge {
	const container = document.createElement("template");
	container.innerHTML = template.trim();

	const element = container.content.firstElementChild as HTMLElement;
	const infoItem = element.querySelector(".badge__item--info") as HTMLElement;
	const warnItem = element.querySelector(".badge__item--warn") as HTMLElement;
	const errorItem = element.querySelector(".badge__item--error") as HTMLElement;

	const updateItem = (item: HTMLElement, count: number) => {
		item.dataset.count = String(count);
		item.textContent = count > 99 ? "99+" : String(count);
		item.classList.toggle("badge__item--visible", count > 0);
	};

	return {
		element,
		update(counts: UnreadCounts) {
			updateItem(infoItem, counts.info);
			updateItem(warnItem, counts.warn);
			updateItem(errorItem, counts.error);
		}
	};
}
