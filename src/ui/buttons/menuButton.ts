import "../../styles/button.css";
import template from "../../templates/buttons/menu-button.html?raw";

type MenuButtonOptions = {
	icon: string;
	ariaLabel: string;
};

type MenuButtonElements = {
	button: HTMLButtonElement;
	iconTarget: HTMLElement;
};

const parseMenuButtonTemplate = (templateHtml: string): MenuButtonElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const button = view.content.firstElementChild as HTMLButtonElement | null;
	if (!button) {
		throw new Error("Menu button template is missing a root button element");
	}

	const iconTarget = button.querySelector(".dock-button__icon") as HTMLElement | null;
	if (!iconTarget) {
		throw new Error("Menu button template is missing .dock-button__icon");
	}

	return { button, iconTarget };
};

export function createMenuButton(options: MenuButtonOptions): HTMLButtonElement {
	const { button, iconTarget } = parseMenuButtonTemplate(template);
	iconTarget.innerHTML = options.icon;
	button.setAttribute("aria-label", options.ariaLabel);
	return button;
}
