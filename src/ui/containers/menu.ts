import "../../styles/controls/button.css";
import "../../styles/containers/menu.css";
import template from "../../templates/containers/menu.html?raw";
import { closeIcon } from "../icons";

export type Menu = {
	element: HTMLElement;
	setContent(content: string | Node): void;
};

export type MenuOptions = {
	content?: string | Node;
};

type MenuElements = {
	element: HTMLElement;
	contentEl: HTMLElement;
	closeButton: HTMLButtonElement;
	closeIconTarget: HTMLElement;
};

export function createMenu(options: MenuOptions): Menu {
	const { element, contentEl, closeButton, closeIconTarget } = parseMenuTemplate(template);

	const setContent = (content: string | Node) => {
		if (typeof content === "string") {
			contentEl.textContent = content;
		} else {
			contentEl.replaceChildren(content);
		}
	};

	closeButton.addEventListener("click", () => {
		element.dispatchEvent(new CustomEvent("dock:close"));
	});

	if (options.content !== undefined) {
		setContent(options.content);
	}

	closeIconTarget.innerHTML = closeIcon;

	return {
		element,
		setContent
	};
}

const parseMenuTemplate = (templateHtml: string): MenuElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement | null;
	const contentEl = element.querySelector(".menu__content") as HTMLElement | null;
	const closeButton = element.querySelector(".menu__close") as HTMLButtonElement | null;
	const closeIconTarget = element.querySelector(".menu__close-icon") as HTMLElement | null;

	return { element, contentEl, closeButton, closeIconTarget };
};
