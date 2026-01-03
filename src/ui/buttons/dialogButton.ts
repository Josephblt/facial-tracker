import "../../styles/button.css";
import template from "../../templates/buttons/dialog-button.html?raw";

type DialogButtonOptions = {
	icon: string;
	ariaLabel: string;
};

type DialogButtonElements = {
	button: HTMLButtonElement;
	iconTarget: HTMLElement;
};

const parseDialogButtonTemplate = (templateHtml: string): DialogButtonElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const button = view.content.firstElementChild as HTMLButtonElement | null;
	if (!button) {
		throw new Error("Dialog button template is missing a root button element");
	}

	const iconTarget = button.querySelector(".dock-button__icon") as HTMLElement | null;
	if (!iconTarget) {
		throw new Error("Dialog button template is missing .dock-button__icon");
	}

	return { button, iconTarget };
};

export function createDialogButton(options: DialogButtonOptions): HTMLButtonElement {
	const { button, iconTarget } = parseDialogButtonTemplate(template);
	iconTarget.innerHTML = options.icon;
	button.setAttribute("aria-label", options.ariaLabel);
	return button;
}
