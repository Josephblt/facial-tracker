import "../../styles/control.css";
import template from "../../templates/controls/control-range.html?raw";

export type SettingsRangeControl = {
	element: HTMLElement;
	setValue(value: number): void;
	setDisabled(disabled: boolean): void;
	onInput(handler: (value: number) => void): void;
};

type SettingsRangeElements = {
	root: HTMLElement;
	labelEl: HTMLLabelElement;
	inputEl: HTMLInputElement;
	valueEl: HTMLOutputElement;
	unitEl: HTMLElement;
};

const parseSettingsRangeTemplate = (templateHtml: string): SettingsRangeElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Settings range template is missing a root element");
	}

	const labelEl = root.querySelector(".settings-control__label") as HTMLLabelElement | null;
	const inputEl = root.querySelector(".settings-control__input") as HTMLInputElement | null;
	const valueEl = root.querySelector(".settings-control__value") as HTMLOutputElement | null;
	const unitEl = root.querySelector(".settings-control__unit") as HTMLElement | null;

	if (!labelEl || !inputEl || !valueEl || !unitEl) {
		throw new Error("Settings range template is missing required sections");
	}

	return { root, labelEl, inputEl, valueEl, unitEl };
};

const formatValue = (value: number): string => {
	if (Number.isInteger(value)) {
		return String(value);
	}
	const fixed = value.toFixed(2);
	return fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed;
};

export function createSettingsRangeControl(options: {
	id: string;
	label: string;
	min: number;
	max: number;
	step: number;
	unit?: string;
}): SettingsRangeControl {
	const { root, labelEl, inputEl, valueEl, unitEl } = parseSettingsRangeTemplate(template);
	const inputHandlers = new Set<(value: number) => void>();
	let min = options.min;
	let max = options.max;

	inputEl.id = options.id;
	inputEl.type = "range";
	inputEl.min = String(options.min);
	inputEl.max = String(options.max);
	inputEl.step = String(options.step);
	inputEl.value = String(options.min);

	const setLabel = (label: string) => {
		labelEl.textContent = label;
		labelEl.htmlFor = inputEl.id;
	};

	const setUnit = (unit?: string) => {
		const hasUnit = Boolean(unit);
		unitEl.textContent = unit ?? "";
		unitEl.style.display = hasUnit ? "inline" : "none";
	};

	const updateValueText = (value: number) => {
		valueEl.textContent = formatValue(value);
	};

	const setValue = (value: number) => {
		if (!Number.isFinite(value)) {
			return;
		}
		const clamped = Math.min(max, Math.max(min, value));
		inputEl.value = String(clamped);
		updateValueText(clamped);
	};

	const setDisabled = (disabled: boolean) => {
		inputEl.disabled = disabled;
	};

	inputEl.addEventListener("input", () => {
		const parsed = Number(inputEl.value);
		updateValueText(parsed);
		for (const handler of inputHandlers) {
			handler(parsed);
		}
	});

	setLabel(options.label);
	setUnit(options.unit);
	setValue(options.min);

	return {
		element: root,
		setValue,
		setDisabled,
		onInput(handler: (value: number) => void) {
			inputHandlers.add(handler);
		}
	};
}
