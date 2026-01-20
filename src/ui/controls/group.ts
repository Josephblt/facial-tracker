import "../../styles/controls/group.css";
import template from "../../templates/controls/group.html?raw";

export type Group = {
	element: HTMLElement;
	bodyEl: HTMLElement;
	setTitle(title: string): void;
};

export type GroupOptions = {
	title: string;
	description?: string | null;
};

type GroupElements = {
	element: HTMLElement;
	titleEl: HTMLElement;
	bodyEl: HTMLElement;
};

export function createGroup(options: GroupOptions): Group {
	const { element, titleEl, bodyEl } = parseGroupTemplate(template);

	const setTitle = (title: string) => {
		titleEl.textContent = title;
		element.setAttribute("aria-label", title);
	};

	setTitle(options.title);

	return {
		element,
		bodyEl,
		setTitle,
	};
}

const parseGroupTemplate = (templateHtml: string): GroupElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement;
	const titleEl = element.querySelector(".group__title") as HTMLElement;
	const bodyEl = element.querySelector(".group__body") as HTMLElement;

	return { element, titleEl, bodyEl };
};
