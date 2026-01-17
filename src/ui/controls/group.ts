import "../../styles/controls/group.css";
import template from "../../templates/controls/group.html?raw";

export type Group = {
	element: HTMLElement;
	bodyEl: HTMLElement;
	setTitle(title: string): void;
	setDescription(description?: string | null): void;
};

export type GroupOptions = {
	title: string;
	description?: string | null;
};

type GroupElements = {
	element: HTMLElement;
	titleEl: HTMLElement;
	descriptionEl: HTMLParagraphElement;
	bodyEl: HTMLElement;
};

export function createGroup(options: GroupOptions): Group {
	const { element, titleEl, descriptionEl, bodyEl } = parseGroupTemplate(template);

	const setTitle = (title: string) => {
		titleEl.textContent = title;
		element.setAttribute("aria-label", title);
	};

	const setDescription = (description?: string | null) => {
		const hasDescription = Boolean(description);
		descriptionEl.textContent = description ?? "";
		descriptionEl.style.display = hasDescription ? "block" : "none";
	};

	setTitle(options.title);
	setDescription(options.description ?? null);

	return {
		element,
		bodyEl,
		setTitle,
		setDescription
	};
}

const parseGroupTemplate = (templateHtml: string): GroupElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement;
	const titleEl = element.querySelector(".group__title") as HTMLElement;
	const descriptionEl = element.querySelector(".group__description") as HTMLParagraphElement;
	const bodyEl = element.querySelector(".group__body") as HTMLElement;

	return { element, titleEl, descriptionEl, bodyEl };
};
