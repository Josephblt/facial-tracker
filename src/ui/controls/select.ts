import "../../styles/controls/select.css";
import template from "../../templates/controls/select.html?raw";

export type SelectOptions = {
	id: string;
	label: string;
	options?: SelectOption[];
};

export type SelectOption = {
	label: string;
	value: string;
};

export type Select = {
	element: HTMLElement;
	setLabel(label: string): void;
	setOptions(options: SelectOption[]): void;
	setValue(value: string): void;
	getValue(): string;
	setDisabled(disabled: boolean): void;
	onChange(handler: (value: string) => void): void;
};

type SelectElements = {
	element: HTMLElement;
	labelEl: HTMLLabelElement;
	fieldEl: HTMLDivElement;
	selectEl: HTMLSelectElement;
};

export function createSelect(options: SelectOptions): Select {
	const { element, labelEl, fieldEl, selectEl } = parseSelectTemplate(template);
	const changeHandlers = new Set<(value: string) => void>();

	selectEl.id = options.id;

	const setLabel = (label: string) => {
		labelEl.textContent = label;
		labelEl.htmlFor = selectEl.id;
	};

	const setOptions = (options: SelectOption[]) => {
		selectEl.replaceChildren(...options.map(createOption));
	};

	const setValue = (value: string) => {
		selectEl.value = value;
	};

	const setDisabled = (disabled: boolean) => {
		selectEl.disabled = disabled;
		fieldEl.classList.toggle("select__field--disabled", disabled);
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
		element,
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

const parseSelectTemplate = (templateHtml: string): SelectElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const element = view.content.firstElementChild as HTMLElement | null;
	const labelEl = element.querySelector(".select__label") as HTMLLabelElement | null;
	const fieldEl = element.querySelector(".select__field") as HTMLDivElement | null;
	const selectEl = element.querySelector(".select__input") as HTMLSelectElement | null;

	return { element, labelEl, fieldEl, selectEl };
};

const createOption = (option: SelectOption) => {
	const element = document.createElement("option");
	element.value = option.value;
	element.textContent = option.label;
	return element;
};
