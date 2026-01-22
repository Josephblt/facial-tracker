import "../../styles/controls/toggle.css";
import template from "../../templates/controls/toggle.html?raw";

export type Toggle = {
	element: HTMLElement;
	setValue(value: boolean): void;
	setDisabled(disabled: boolean): void;
	onChange(handler: (value: boolean) => void): void;
};

export type ToggleOptions = {
	id: string;
	label: string;
};

type ToggleElements = {
	element: HTMLElement;
	labelEl: HTMLLabelElement;
	inputEl: HTMLInputElement;
};

export function createToggle(options: ToggleOptions): Toggle {
	const { element, labelEl, inputEl } = parseToggleTemplate(template);
	const changeHandlers = new Set<(value: boolean) => void>();

	inputEl.id = options.id;
	inputEl.type = "checkbox";

	const setLabel = (label: string) => {
		labelEl.textContent = label;
		labelEl.htmlFor = inputEl.id;
	};

	const setValue = (value: boolean) => {
		inputEl.checked = value;
	};

	const setDisabled = (disabled: boolean) => {
		inputEl.disabled = disabled;
	};

	inputEl.addEventListener("change", () => {
		for (const handler of changeHandlers) {
			handler(inputEl.checked);
		}
	});

	setLabel(options.label);

	return {
		element,
		setValue,
		setDisabled,
		onChange(handler: (value: boolean) => void) {
			changeHandlers.add(handler);
		}
	};
}

const parseToggleTemplate = (templateHtml: string): ToggleElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement | null;
	const labelEl = element.querySelector(".toggle__label") as HTMLLabelElement | null;
	const inputEl = element.querySelector(".toggle__input") as HTMLInputElement | null;

	return { element: element, labelEl, inputEl };
};
