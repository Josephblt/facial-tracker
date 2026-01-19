import "../../styles/controls/range.css";
import template from "../../templates/controls/range.html?raw";

export type Range = {
	element: HTMLElement;
	setValue(value: number): void;
	setDisabled(disabled: boolean): void;
	onInput(handler: (value: number) => void): void;
};

export type RangeOptions = {
	id: string;
	label: string;
	min: number;
	max: number;
	step: number;
	unit?: string;
};

type RangeElements = {
	element: HTMLElement;
	labelEl: HTMLLabelElement;
	inputEl: HTMLInputElement;
	valueEl: HTMLOutputElement;
	unitEl: HTMLElement;
};

export function createRangeControl(options: RangeOptions): Range {
	const { element, labelEl, inputEl, valueEl, unitEl } = parseRangeTemplate(template);
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
		updateTrackProgress(clamped);
	};

	const setDisabled = (disabled: boolean) => {
		inputEl.disabled = disabled;
	};

	const updateValueText = (value: number) => {
		valueEl.textContent = formatValue(value);
	};

	const updateTrackProgress = (value: number) => {
		if (!Number.isFinite(value)) {
			return;
		}
		const span = max - min;
		if (span <= 0) {
			inputEl.style.setProperty("--range-progress", "0%");
			return;
		}
		const percent = ((value - min) / span) * 100;
		const clamped = Math.min(100, Math.max(0, percent));
		inputEl.style.setProperty("--range-progress", `${clamped}%`);
	};

	inputEl.addEventListener("input", () => {
		const parsed = Number(inputEl.value);
		updateValueText(parsed);
		updateTrackProgress(parsed);
		for (const handler of inputHandlers) {
			handler(parsed);
		}
	});

	setLabel(options.label);
	setUnit(options.unit);
	setValue(options.min);

	return {
		element,
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

	const element = view.content.firstElementChild as HTMLElement;
	const labelEl = element.querySelector(".range__label") as HTMLLabelElement;
	const inputEl = element.querySelector(".range__input") as HTMLInputElement;
	const valueEl = element.querySelector(".range__value") as HTMLOutputElement;
	const unitEl = element.querySelector(".range__unit") as HTMLElement;

	return { element, labelEl, inputEl, valueEl, unitEl };
};

const formatValue = (value: number): string => {
	if (Number.isInteger(value)) {
		return String(value);
	}
	const fixed = value.toFixed(2);
	return fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed;
};
