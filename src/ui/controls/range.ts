import "../../styles/controls/range.css";
import template from "../../templates/controls/range.html?raw";

type RangeControl = {
	element: HTMLElement;
	setValue(value: number): void;
	setDisabled(disabled: boolean): void;
	onInput(handler: (value: number) => void): void;
};

type RangeElements = {
	rangeEl: HTMLElement;
	labelEl: HTMLLabelElement;
	inputEl: HTMLInputElement;
	valueEl: HTMLOutputElement;
	unitEl: HTMLElement;
};

export function createRangeControl(options: {
	id: string;
	label: string;
	min: number;
	max: number;
	step: number;
	unit?: string;
}): RangeControl {
	const { rangeEl, labelEl, inputEl, valueEl, unitEl } = parseRangeTemplate(template);
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

	const updateValueText = (value: number) => {
		valueEl.textContent = formatValue(value);
	};

	setLabel(options.label);
	setUnit(options.unit);
	setValue(options.min);

	return {
		element: rangeEl,
		setValue,
		setDisabled,
		onInput(handler: (value: number) => void) {
			inputHandlers.add(handler);
		}
	};
}

const parseRangeTemplate = (templateHtml: string): RangeElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const rangeEl = view.content.firstElementChild as HTMLElement | null;

	const labelEl = rangeEl.querySelector(".range__label") as HTMLLabelElement | null;
	const inputEl = rangeEl.querySelector(".range__input") as HTMLInputElement | null;
	const valueEl = rangeEl.querySelector(".range__value") as HTMLOutputElement | null;
	const unitEl = rangeEl.querySelector(".range__unit") as HTMLElement | null;

	return { rangeEl, labelEl, inputEl, valueEl, unitEl };
};

const formatValue = (value: number): string => {
	if (Number.isInteger(value)) {
		return String(value);
	}
	const fixed = value.toFixed(2);
	return fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed;
};
