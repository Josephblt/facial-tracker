import "../../styles/controls/button.css";
import "../../styles/containers/menu.css";
import template from "../../templates/containers/menu-component.html?raw";
import { closeIcon } from "../icons";

export type MenuComponent = {
	element: HTMLElement;
	setContent(content: string | Node): void;
};

type MenuElements = {
	root: HTMLElement;
	contentEl: HTMLElement;
	closeButton: HTMLButtonElement;
	closeIconTarget: HTMLElement;
};

const parseMenuTemplate = (templateHtml: string): MenuElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Menu template is missing a root element");
	}

	const contentEl = root.querySelector(".menu__content") as HTMLElement | null;
	const closeButton = root.querySelector(".menu__close") as HTMLButtonElement | null;
	const closeIconTarget = root.querySelector(".menu__close-icon") as HTMLElement | null;

	if (!contentEl || !closeButton || !closeIconTarget) {
		throw new Error("Menu template is missing required sections");
	}

	return { root, contentEl, closeButton, closeIconTarget };
};

export function createMenuComponent(options: { content?: string | Node }): MenuComponent {
	const { root, contentEl, closeButton, closeIconTarget } = parseMenuTemplate(template);

	const setContent = (content: string | Node) => {
		if (typeof content === "string") {
			contentEl.textContent = content;
		} else {
			contentEl.replaceChildren(content);
		}
	};

	if (options.content !== undefined) {
		setContent(options.content);
	}

	closeIconTarget.innerHTML = closeIcon;

	closeButton.addEventListener("click", () => {
		root.dispatchEvent(new CustomEvent("dock:close"));
	});

	return {
		element: root,
		setContent
	};
}
