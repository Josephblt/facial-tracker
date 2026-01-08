import "../../styles/settings.css";
import template from "../../templates/components/settings-component.html?raw";
import type { CameraController } from "./cameraComponent";
import { CameraService } from "../../services/cameraService";
import { createSettingsGroup } from "../controls/group-control";
import { createSettingsRangeControl } from "../controls/rangeControl";
import { createSettingsSelectControl } from "../controls/selectControl";
import { createSettingsToggleControl } from "../controls/toggleControl";

export type SettingsComponent = {
	element: HTMLElement;
	refreshCameras(): Promise<void>;
};

type SettingsElements = {
	root: HTMLElement;
	contentEl: HTMLElement;
};

type ControlBinding = {
	key: string;
	element: HTMLElement;
	setValue: (value: unknown) => void;
	setDisabled: (disabled: boolean) => void;
};

type RangeCapability = {
	min: number;
	max: number;
	step?: number;
};

const LABEL_OVERRIDES: Record<string, string> = {
	frameRate: "Frame rate",
	facingMode: "Facing mode",
	resizeMode: "Resize mode",
	whiteBalanceMode: "White balance mode",
	exposureMode: "Exposure mode",
	focusMode: "Focus mode"
};

const UNIT_BY_KEY: Record<string, string> = {
	width: "px",
	height: "px",
	frameRate: "fps",
	exposureTime: "ms",
	zoom: "x"
};

const HIDDEN_KEYS = new Set(["deviceId", "groupId"]);

const PRIORITY_KEYS = ["width", "height", "frameRate", "facingMode"];

const parseSettingsTemplate = (templateHtml: string): SettingsElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Settings template is missing a root element");
	}

	const contentEl = root.querySelector(".settings__content") as HTMLElement | null;
	if (!contentEl) {
		throw new Error("Settings template is missing required sections");
	}

	return { root, contentEl };
};

const formatLabel = (key: string): string => {
	if (LABEL_OVERRIDES[key]) {
		return LABEL_OVERRIDES[key];
	}
	return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
};

const isNumber = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value);

const isRangeCapability = (value: unknown): value is RangeCapability => {
	if (!value || typeof value !== "object") return false;
	const record = value as Record<string, unknown>;
	return isNumber(record.min) && isNumber(record.max);
};

const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every(item => typeof item === "string");

const getRangeStep = (range: RangeCapability): number => {
	if (isNumber(range.step) && range.step > 0) {
		return range.step;
	}
	const delta = range.max - range.min;
	if (Number.isInteger(range.min) && Number.isInteger(range.max)) {
		return 1;
	}
	if (delta <= 1) {
		return 0.01;
	}
	if (delta <= 10) {
		return 0.1;
	}
	return 1;
};

const getSupportedConstraints = (): Record<string, boolean> | null => {
	if (!navigator.mediaDevices?.getSupportedConstraints) {
		return null;
	}
	return navigator.mediaDevices.getSupportedConstraints() as Record<string, boolean>;
};

const sortCapabilityKeys = ([keyA]: [string, unknown], [keyB]: [string, unknown]) => {
	const priorityA = PRIORITY_KEYS.indexOf(keyA);
	const priorityB = PRIORITY_KEYS.indexOf(keyB);
	if (priorityA === -1 && priorityB === -1) {
		return keyA.localeCompare(keyB);
	}
	if (priorityA === -1) return 1;
	if (priorityB === -1) return -1;
	return priorityA - priorityB;
};

export function createSettingsComponent(
	camera: CameraController,
	cameraService: CameraService
): SettingsComponent {
	const { root, contentEl } = parseSettingsTemplate(template);
	const deviceGroup = createSettingsGroup({ title: "Camera" });
	const controlsGroup = createSettingsGroup({ title: "Controls" });
	controlsGroup.element.hidden = true;

	contentEl.append(deviceGroup.element, controlsGroup.element);

	const deviceControl = createSettingsSelectControl({
		id: "settings-camera-select",
		label: "Camera",
		options: [{ label: "Loading cameras...", value: "" }]
	});
	deviceControl.setDisabled(true);
	deviceGroup.body.append(deviceControl.element);

	const resetRow = document.createElement("div");
	resetRow.className = "settings-control settings-control--action";

	const resetLabel = document.createElement("span");
	resetLabel.className = "settings-control__label";
	resetLabel.textContent = "Reset";

	const resetField = document.createElement("div");
	resetField.className = "settings-control__field";

	const resetButton = document.createElement("button");
	resetButton.className = "settings-control__button";
	resetButton.type = "button";
	resetButton.id = "settings-reset-button";
	resetButton.textContent = "Reset defaults";
	resetButton.disabled = true;

	resetField.append(resetButton);
	resetRow.append(resetLabel, resetField);
	deviceGroup.body.append(resetRow);

	let controlBindings: ControlBinding[] = [];
	const applyTimers = new Map<string, number>();

	const getVideoTrack = () => cameraService.getStream()?.getVideoTracks()[0] ?? null;
	const getSelectedDeviceId = () => deviceControl.getValue().trim();

	const updateControlWidths = () => {
		const updateWidthVar = (selector: string, variableName: string) => {
			root.style.removeProperty(variableName);
			const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
			if (!elements.length) {
				return;
			}

			let maxWidth = 0;
			for (const element of elements) {
				const rectWidth = element.getBoundingClientRect().width;
				const scrollWidth = element.scrollWidth;
				maxWidth = Math.max(maxWidth, rectWidth, scrollWidth);
			}

			if (maxWidth > 0) {
				root.style.setProperty(variableName, `${Math.ceil(maxWidth)}px`);
			}
		};

		updateWidthVar(".settings-control__label", "--settings-label-width");
		updateWidthVar(".settings-control__meta", "--settings-meta-width");
	};

	const scheduleControlWidthUpdate = () => {
		window.requestAnimationFrame(updateControlWidths);
	};

	const clearApplyTimers = () => {
		for (const timer of applyTimers.values()) {
			window.clearTimeout(timer);
		}
		applyTimers.clear();
	};

	const syncSelectionWithStream = () => {
		const track = getVideoTrack();
		const deviceId = track?.getSettings().deviceId;
		if (!deviceId) return;
		deviceControl.setValue(deviceId);
	};

	const updateResetState = () => {
		const deviceId = getSelectedDeviceId();
		const track = getVideoTrack();
		resetButton.disabled = !deviceId || !track;
	};

	const syncControlValues = () => {
		const track = getVideoTrack();
		if (!track) return;
		const settings = track.getSettings() as Record<string, unknown>;
		for (const control of controlBindings) {
			if (settings[control.key] !== undefined) {
				control.setValue(settings[control.key]);
			}
		}
		scheduleControlWidthUpdate();
	};

	const applyConstraint = async (key: string, value: number | string | boolean) => {
		const track = getVideoTrack();
		if (!track || typeof track.applyConstraints !== "function") return;
		try {
			await track.applyConstraints({ [key]: value });
		} catch {
			// Ignore failed constraints and resync to actual settings.
		}
		syncControlValues();
	};

	const scheduleApply = (key: string, value: number | string | boolean, delayMs: number) => {
		const existingTimer = applyTimers.get(key);
		if (existingTimer) {
			window.clearTimeout(existingTimer);
		}
		const timer = window.setTimeout(() => {
			applyTimers.delete(key);
			void applyConstraint(key, value);
		}, delayMs);
		applyTimers.set(key, timer);
	};

	const buildControls = () => {
		const track = getVideoTrack();
		clearApplyTimers();
		controlBindings = [];
		controlsGroup.body.replaceChildren();

		if (!track || typeof track.getCapabilities !== "function") {
			controlsGroup.element.hidden = true;
			updateResetState();
			scheduleControlWidthUpdate();
			return;
		}

		const capabilities = track.getCapabilities();
		const supportedConstraints = getSupportedConstraints();
		const canApply = typeof track.applyConstraints === "function";
		const entries = Object.entries(capabilities)
			.filter(([key, value]) => {
				if (HIDDEN_KEYS.has(key)) return false;
				if (supportedConstraints && !supportedConstraints[key]) return false;
				if (isRangeCapability(value)) {
					return value.max > value.min;
				}
				if (isStringArray(value)) {
					return value.length > 1;
				}
				if (typeof value === "boolean") {
					return true;
				}
				return false;
			})
			.sort(sortCapabilityKeys);

		for (const [key, value] of entries) {
			const label = formatLabel(key);
			const unit = UNIT_BY_KEY[key];
			const controlId = `settings-${key}`;

			if (isRangeCapability(value)) {
				const step = getRangeStep(value);
				const rangeControl = createSettingsRangeControl({
					id: controlId,
					label,
					min: value.min,
					max: value.max,
					step,
					unit
				});
				rangeControl.setDisabled(!canApply);
				rangeControl.onInput((nextValue) => {
					scheduleApply(key, nextValue, 150);
				});
				controlBindings.push({
					key,
					element: rangeControl.element,
					setValue: (nextValue: unknown) => {
						if (isNumber(nextValue)) {
							rangeControl.setValue(nextValue);
						}
					},
					setDisabled: rangeControl.setDisabled
				});
				controlsGroup.body.append(rangeControl.element);
				continue;
			}

			if (isStringArray(value)) {
				const selectControl = createSettingsSelectControl({
					id: controlId,
					label,
					options: value.map(option => ({ label: option, value: option }))
				});
				selectControl.setDisabled(!canApply);
				selectControl.onChange((nextValue) => {
					scheduleApply(key, nextValue, 0);
				});
				controlBindings.push({
					key,
					element: selectControl.element,
					setValue: (nextValue: unknown) => {
						if (typeof nextValue === "string") {
							selectControl.setValue(nextValue);
						}
					},
					setDisabled: selectControl.setDisabled
				});
				controlsGroup.body.append(selectControl.element);
				continue;
			}

			if (typeof value === "boolean") {
				const toggleControl = createSettingsToggleControl({
					id: controlId,
					label
				});
				toggleControl.setDisabled(!canApply);
				toggleControl.onChange((nextValue) => {
					scheduleApply(key, nextValue, 0);
				});
				controlBindings.push({
					key,
					element: toggleControl.element,
					setValue: (nextValue: unknown) => {
						if (typeof nextValue === "boolean") {
							toggleControl.setValue(nextValue);
						}
					},
					setDisabled: toggleControl.setDisabled
				});
				controlsGroup.body.append(toggleControl.element);
			}
		}

		controlsGroup.element.hidden = controlBindings.length === 0;
		syncControlValues();
		updateResetState();
		scheduleControlWidthUpdate();
	};

	const refreshCameras = async () => {
		if (!navigator.mediaDevices?.enumerateDevices) {
			deviceControl.setOptions([{ label: "Camera selection unavailable", value: "" }]);
			deviceControl.setDisabled(true);
			buildControls();
			return;
		}

		const preferredId = deviceControl.getValue();
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(device => device.kind === "videoinput");

			if (!cameras.length) {
				deviceControl.setOptions([{ label: "No cameras found", value: "" }]);
				deviceControl.setDisabled(true);
				buildControls();
				return;
			}

			deviceControl.setDisabled(false);
			deviceControl.setOptions(
				cameras.map((cameraInfo, index) => ({
					label: cameraInfo.label.trim() || `Camera ${index + 1}`,
					value: cameraInfo.deviceId
				}))
			);

			if (preferredId && cameras.some(cameraInfo => cameraInfo.deviceId === preferredId)) {
				deviceControl.setValue(preferredId);
			} else {
				syncSelectionWithStream();
			}
		} catch {
			deviceControl.setOptions([{ label: "Unable to list cameras", value: "" }]);
			deviceControl.setDisabled(true);
		}

		buildControls();
	};

	deviceControl.onChange((deviceId) => {
		if (!deviceId) return;
		camera.setConstraints({ video: { deviceId: { exact: deviceId } }, audio: false });
		void camera.start().finally(buildControls);
	});

	resetButton.addEventListener("click", () => {
		const deviceId = getSelectedDeviceId();
		if (!deviceId) return;
		camera.setConstraints({ video: { deviceId: { exact: deviceId } }, audio: false });
		void camera.start().finally(buildControls);
	});

	if (navigator.mediaDevices?.addEventListener) {
		navigator.mediaDevices.addEventListener("devicechange", () => {
			void refreshCameras();
		});
	}

	root.addEventListener("input", () => {
		scheduleControlWidthUpdate();
	});

	return {
		element: root,
		refreshCameras
	};
}
