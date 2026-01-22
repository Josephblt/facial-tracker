import "../../styles/controls/button.css";
import "../../styles/containers/dialog.css";
import template from "../../templates/containers/dialog.html?raw";
import { closeIcon } from "../icons";

export type Dialog = {
	element: HTMLElement;
	setTitle(title: string): void;
	setContent(content: string | Node): void;
};

export type DialogOptions = {
	title: string;
	content?: string | Node;
};

type DialogElements = {
	element: HTMLElement;
	titleEl: HTMLElement;
	contentEl: HTMLElement;
	closeButton: HTMLButtonElement;
};

export function createDialog(options: DialogOptions): Dialog {
	const { element, titleEl, contentEl, closeButton } = parseDialogTemplate(template);

	const setTitle = (title: string) => {
		titleEl.textContent = title;
		element.setAttribute("aria-label", title);
	};

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

	setTitle(options.title);

	if (options.content !== undefined) {
		setContent(options.content);
	}

	return {
		element,
		setTitle,
		setContent
	};
}

const parseDialogTemplate = (templateHtml: string): DialogElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement | null;

	const titleEl = element.querySelector(".dialog__title") as HTMLElement | null;
	const contentEl = element.querySelector(".dialog__content-inner") as HTMLElement | null;
	const closeButton = element.querySelector(".dialog__close") as HTMLButtonElement | null;
	const closeIconTarget = element.querySelector(".dialog__close-icon") as HTMLElement | null;

	closeIconTarget.innerHTML = closeIcon;

	return { element, titleEl, contentEl, closeButton };
};
