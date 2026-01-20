import "../../styles/controls/button.css";
import template from "../../templates/controls/button.html?raw";

export type ButtonOptions = {
	icon: string;
	ariaLabel: string;
};

type ButtonElements = {
	element: HTMLButtonElement;
	iconTarget: HTMLElement;
};

export const createButton = (options: ButtonOptions): HTMLButtonElement => {
	const { element: button, iconTarget } = parseButtonTemplate(template);
	iconTarget.innerHTML = options.icon;
	button.setAttribute("aria-label", options.ariaLabel);
	return button;
};

const parseButtonTemplate = (templateHtml: string): ButtonElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const button = view.content.firstElementChild as HTMLButtonElement;
	const iconTarget = button.querySelector(".button__icon") as HTMLElement;
	
	return { element: button, iconTarget };
};
