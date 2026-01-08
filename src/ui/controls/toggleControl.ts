import "../../styles/control.css";
import template from "../../templates/controls/toggle-control.htm?raw";

export type SettingsToggleControl = {
	element: HTMLElement;
	setValue(value: boolean): void;
	setDisabled(disabled: boolean): void;
	onChange(handler: (value: boolean) => void): void;
};

type SettingsToggleElements = {
	root: HTMLElement;
	labelEl: HTMLLabelElement;
	inputEl: HTMLInputElement;
};

const parseSettingsToggleTemplate = (templateHtml: string): SettingsToggleElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Settings toggle template is missing a root element");
	}

	const labelEl = root.querySelector(".settings-control__label") as HTMLLabelElement | null;
	const inputEl = root.querySelector(".settings-control__toggle") as HTMLInputElement | null;

	if (!labelEl || !inputEl) {
		throw new Error("Settings toggle template is missing required sections");
	}

	return { root, labelEl, inputEl };
};

export function createSettingsToggleControl(options: { id: string; label: string }): SettingsToggleControl {
	const { root, labelEl, inputEl } = parseSettingsToggleTemplate(template);
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
		element: root,
		setValue,
		setDisabled,
		onChange(handler: (value: boolean) => void) {
			changeHandlers.add(handler);
		}
	};
}
