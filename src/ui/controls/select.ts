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
	triggerEl: HTMLButtonElement;
	valueEl: HTMLSpanElement;
	panelEl: HTMLDivElement;
};

export function createSelect(options: SelectOptions): Select {
	const { element, labelEl, fieldEl, triggerEl, valueEl, panelEl } = parseSelectTemplate(template);
	const changeHandlers = new Set<(value: string) => void>();
	let optionElements: HTMLButtonElement[] = [];
	let selectOptions: SelectOption[] = [];
	let currentValue: string | null = null;
	let isOpen = false;

	triggerEl.id = options.id;
	const panelId = `${options.id}-panel`;
	panelEl.id = panelId;
	triggerEl.setAttribute("aria-controls", panelId);

	const setLabel = (label: string) => {
		labelEl.textContent = label;
		labelEl.htmlFor = triggerEl.id;
	};

	const updateSelection = () => {
		const active = selectOptions.find(option => option.value === currentValue);
		valueEl.textContent = active ? active.label : "";
		for (const optionEl of optionElements) {
			const selected = optionEl.dataset.value === currentValue;
			optionEl.classList.toggle("select__option--selected", selected);
			optionEl.setAttribute("aria-selected", selected ? "true" : "false");
		}
	};

	const ensureValue = () => {
		if (!selectOptions.length) {
			currentValue = null;
			return;
		}
		if (currentValue === null || !selectOptions.some(option => option.value === currentValue)) {
			currentValue = selectOptions[0].value;
		}
	};

	const applyValue = (value: string, notify: boolean) => {
		if (!selectOptions.some(option => option.value === value)) {
			return;
		}
		if (currentValue === value) {
			updateSelection();
			return;
		}
		currentValue = value;
		updateSelection();
		if (notify) {
			for (const handler of changeHandlers) {
				handler(value);
			}
		}
	};

	const selectValue = (value: string) => {
		applyValue(value, true);
	};

	const closePanel = () => {
		if (!isOpen) return;
		isOpen = false;
		fieldEl.classList.remove("select__field--open");
		triggerEl.setAttribute("aria-expanded", "false");
	};

	const scrollSelectedIntoView = () => {
		const selectedEl = optionElements.find(optionEl => optionEl.dataset.value === currentValue);
		if (selectedEl) {
			selectedEl.scrollIntoView({ block: "nearest" });
		}
	};

	const openPanel = () => {
		if (isOpen || triggerEl.disabled) return;
		isOpen = true;
		fieldEl.classList.add("select__field--open");
		triggerEl.setAttribute("aria-expanded", "true");
		scrollSelectedIntoView();
	};

	const togglePanel = () => {
		if (isOpen) {
			closePanel();
			return;
		}
		openPanel();
	};

	const renderOptions = () => {
		optionElements = selectOptions.map(option => {
			const optionEl = document.createElement("button");
			optionEl.type = "button";
			optionEl.className = "select__option";
			optionEl.textContent = option.label;
			optionEl.dataset.value = option.value;
			optionEl.setAttribute("role", "option");
			optionEl.addEventListener("click", (event) => {
				event.preventDefault();
				selectValue(option.value);
				closePanel();
				triggerEl.focus();
			});
			return optionEl;
		});

		panelEl.replaceChildren(...optionElements);
	};

	const setOptions = (nextOptions: SelectOption[]) => {
		selectOptions = nextOptions;
		renderOptions();
		ensureValue();
		updateSelection();
	};

	const setValue = (value: string) => {
		applyValue(value, false);
	};

	const moveSelection = (delta: number) => {
		if (!selectOptions.length) return;
		const currentIndex = selectOptions.findIndex(option => option.value === currentValue);
		const startIndex = currentIndex === -1 ? 0 : currentIndex;
		const nextIndex = Math.min(selectOptions.length - 1, Math.max(0, startIndex + delta));
		const nextValue = selectOptions[nextIndex].value;
		applyValue(nextValue, true);
		if (isOpen) {
			scrollSelectedIntoView();
		}
	};

	const setDisabled = (disabled: boolean) => {
		triggerEl.disabled = disabled;
		fieldEl.classList.toggle("select__field--disabled", disabled);
		if (disabled) {
			closePanel();
		}
	};

	triggerEl.addEventListener("click", () => {
		togglePanel();
	});

	triggerEl.addEventListener("keydown", (event) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveSelection(1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveSelection(-1);
				break;
			case "Home":
				event.preventDefault();
				if (selectOptions.length) {
					applyValue(selectOptions[0].value, true);
				}
				break;
			case "End":
				event.preventDefault();
				if (selectOptions.length) {
					applyValue(selectOptions[selectOptions.length - 1].value, true);
				}
				break;
			case "Enter":
			case " ":
			case "Spacebar":
				event.preventDefault();
				togglePanel();
				break;
			case "Escape":
				if (isOpen) {
					event.preventDefault();
					closePanel();
				}
				break;
		}
	});

	document.addEventListener("pointerdown", (event) => {
		if (!isOpen) return;
		const target = event.target as Node | null;
		if (!target || !element.contains(target)) {
			closePanel();
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
		getValue: () => currentValue ?? "",
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
	const triggerEl = element.querySelector(".select__trigger") as HTMLButtonElement | null;
	const valueEl = element.querySelector(".select__value") as HTMLSpanElement | null;
	const panelEl = element.querySelector(".select__panel") as HTMLDivElement | null;

	return { element, labelEl, fieldEl, triggerEl, valueEl, panelEl };
};
