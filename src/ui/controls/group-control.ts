import "../../styles/group.css";
import template from "../../templates/controls/group-control.html?raw";

export type SettingsGroup = {
	element: HTMLElement;
	body: HTMLElement;
	setTitle(title: string): void;
	setDescription(description?: string | null): void;
};

type SettingsGroupElements = {
	root: HTMLElement;
	titleEl: HTMLElement;
	descriptionEl: HTMLParagraphElement;
	bodyEl: HTMLElement;
};

const parseGroupTemplate = (templateHtml: string): SettingsGroupElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Group template is missing a root element");
	}

	const titleEl = root.querySelector(".settings-group__title") as HTMLElement | null;
	const descriptionEl = root.querySelector(".settings-group__description") as HTMLParagraphElement | null;
	const bodyEl = root.querySelector(".settings-group__body") as HTMLElement | null;

	if (!titleEl || !descriptionEl || !bodyEl) {
		throw new Error("Group template is missing required sections");
	}

	return { root, titleEl, descriptionEl, bodyEl };
};

export function createSettingsGroup(options: {
	title: string;
	description?: string | null;
}): SettingsGroup {
	const { root, titleEl, descriptionEl, bodyEl } = parseGroupTemplate(template);

	const setTitle = (title: string) => {
		titleEl.textContent = title;
		root.setAttribute("aria-label", title);
	};

	const setDescription = (description?: string | null) => {
		const hasDescription = Boolean(description);
		descriptionEl.textContent = description ?? "";
		descriptionEl.style.display = hasDescription ? "block" : "none";
	};

	setTitle(options.title);
	setDescription(options.description ?? null);

	return {
		element: root,
		body: bodyEl,
		setTitle,
		setDescription
	};
}
