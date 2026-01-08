import "../../styles/control.css";
import template from "../../templates/controls/select-control.html?raw";

export type SettingsSelectOption = {
	label: string;
	value: string;
};

export type SettingsSelectControl = {
	element: HTMLElement;
	setLabel(label: string): void;
	setOptions(options: SettingsSelectOption[]): void;
	setValue(value: string): void;
	getValue(): string;
	setDisabled(disabled: boolean): void;
	onChange(handler: (value: string) => void): void;
};

type SettingsSelectElements = {
	root: HTMLElement;
	labelEl: HTMLLabelElement;
	selectEl: HTMLSelectElement;
};

const createOption = (option: SettingsSelectOption) => {
	const element = document.createElement("option");
	element.value = option.value;
	element.textContent = option.label;
	return element;
};

const parseSettingsSelectTemplate = (templateHtml: string): SettingsSelectElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Settings select template is missing a root element");
	}

	const labelEl = root.querySelector(".settings-control__label") as HTMLLabelElement | null;
	const selectEl = root.querySelector(".settings-control__select") as HTMLSelectElement | null;

	if (!labelEl || !selectEl) {
		throw new Error("Settings select template is missing required sections");
	}

	return { root, labelEl, selectEl };
};

export function createSettingsSelectControl(options: {
	id: string;
	label: string;
	options?: SettingsSelectOption[];
}): SettingsSelectControl {
	const { root, labelEl, selectEl } = parseSettingsSelectTemplate(template);
	const changeHandlers = new Set<(value: string) => void>();

	selectEl.id = options.id;

	const setLabel = (label: string) => {
		labelEl.textContent = label;
		labelEl.htmlFor = selectEl.id;
	};

	const setOptions = (options: SettingsSelectOption[]) => {
		selectEl.replaceChildren(...options.map(createOption));
	};

	const setValue = (value: string) => {
		selectEl.value = value;
	};

	const setDisabled = (disabled: boolean) => {
		selectEl.disabled = disabled;
	};

	selectEl.addEventListener("change", () => {
		for (const handler of changeHandlers) {
			handler(selectEl.value);
		}
	});

	setLabel(options.label);
	if (options.options) {
		setOptions(options.options);
	}

	return {
		element: root,
		setLabel,
		setOptions,
		setValue,
		getValue: () => selectEl.value,
		setDisabled,
		onChange(handler: (value: string) => void) {
			changeHandlers.add(handler);
		}
	};
}
