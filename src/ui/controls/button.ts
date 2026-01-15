import "../../styles/controls/button.css";
import template from "../../templates/controls/button.html?raw";

type ButtonOptions = {
	icon: string;
	ariaLabel: string;
};

type ButtonElements = {
	button: HTMLButtonElement;
	iconTarget: HTMLElement;
};

export const createButton = (options: ButtonOptions): HTMLButtonElement => {
	const { button, iconTarget } = parseButtonTemplate(template);
	iconTarget.innerHTML = options.icon;
	button.setAttribute("aria-label", options.ariaLabel);
	return button;
};

const parseButtonTemplate = (templateHtml: string): ButtonElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const button = view.content.firstElementChild as HTMLButtonElement | null;
	const iconTarget = button.querySelector(".button__icon") as HTMLElement | null;
	
	return { button, iconTarget };
};
