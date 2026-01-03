import "../../styles/button.css";
import "../../styles/dialog.css";
import template from "../../templates/components/dialog-component.html?raw";
import { closeIcon } from "../icons";

export type Dialog = {
	element: HTMLElement;
	setTitle(title: string): void;
	setContent(content: string | Node): void;
};

type DialogElements = {
	root: HTMLElement;
	titleEl: HTMLElement;
	contentEl: HTMLElement;
	closeButton: HTMLButtonElement;
};

const parseDialogTemplate = (templateHtml: string): DialogElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Dialog template is missing a root element");
	}

	const titleEl = root.querySelector(".dialog__title") as HTMLElement | null;
	const contentEl = root.querySelector(".dialog__content-inner") as HTMLElement | null;
	const closeButton = root.querySelector(".dialog__close") as HTMLButtonElement | null;
	const closeIconTarget = root.querySelector(".dialog__close-icon") as HTMLElement | null;

	if (!titleEl || !contentEl || !closeButton || !closeIconTarget) {
		throw new Error("Dialog template is missing required sections");
	}

	closeIconTarget.innerHTML = closeIcon;

	return { root, titleEl, contentEl, closeButton };
};

export function createDialog(options: { title: string; content?: string | Node }): Dialog {
	const { root, titleEl, contentEl, closeButton } = parseDialogTemplate(template);

	const setTitle = (title: string) => {
		titleEl.textContent = title;
		root.setAttribute("aria-label", title);
	};

	const setContent = (content: string | Node) => {
		if (typeof content === "string") {
			contentEl.textContent = content;
		} else {
			contentEl.replaceChildren(content);
		}
	};

	setTitle(options.title);

	if (options.content !== undefined) {
		setContent(options.content);
	}

	closeButton.addEventListener("click", () => {
		root.dispatchEvent(new CustomEvent("dock:close"));
	});

	return {
		element: root,
		setTitle,
		setContent
	};
}
