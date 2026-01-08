import "../../styles/settings.css";
import type { CameraController } from "./cameraComponent";
import { CameraService } from "../../services/cameraService";

export type SettingsComponent = {
	element: HTMLElement;
	refreshCameras(): Promise<void>;
};

const createOption = (label: string, value: string) => {
	const option = document.createElement("option");
	option.value = value;
	option.textContent = label;
	return option;
};

export function createSettingsComponent(
	camera: CameraController,
	cameraService: CameraService
): SettingsComponent {
	const root = document.createElement("section");
	root.className = "settings";
	root.setAttribute("aria-label", "Settings");

	const group = document.createElement("div");
	group.className = "settings__group";

	const label = document.createElement("label");
	label.className = "settings__label";
	label.textContent = "Camera";

	const select = document.createElement("select");
	select.className = "settings__select";
	select.id = "settings-camera-select";
	label.htmlFor = select.id;

	select.appendChild(createOption("Loading cameras...", ""));
	select.disabled = true;

	group.append(label, select);
	root.appendChild(group);

	const syncSelectionWithStream = () => {
		const stream = cameraService.getStream();
		const track = stream?.getVideoTracks()[0];
		const deviceId = track?.getSettings().deviceId;
		if (!deviceId) return;
		const match = Array.from(select.options).find(option => option.value === deviceId);
		if (match) {
			select.value = deviceId;
		}
	};

	const refreshCameras = async () => {
		if (!navigator.mediaDevices?.enumerateDevices) {
			select.replaceChildren(createOption("Camera selection unavailable", ""));
			select.disabled = true;
			return;
		}

		const preferredId = select.value;
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const cameras = devices.filter(device => device.kind === "videoinput");
			select.replaceChildren();

			if (!cameras.length) {
				select.appendChild(createOption("No cameras found", ""));
				select.disabled = true;
				return;
			}

			select.disabled = false;
			cameras.forEach((cameraInfo, index) => {
				const label = cameraInfo.label.trim() || `Camera ${index + 1}`;
				select.appendChild(createOption(label, cameraInfo.deviceId));
			});

			if (preferredId && Array.from(select.options).some(option => option.value === preferredId)) {
				select.value = preferredId;
			} else {
				syncSelectionWithStream();
			}
		} catch {
			select.replaceChildren(createOption("Unable to list cameras", ""));
			select.disabled = true;
		}
	};

	select.addEventListener("change", () => {
		const deviceId = select.value;
		if (!deviceId) return;
		camera.setConstraints({ video: { deviceId: { exact: deviceId } }, audio: false });
		void camera.start();
	});

	if (navigator.mediaDevices?.addEventListener) {
		navigator.mediaDevices.addEventListener("devicechange", () => {
			void refreshCameras();
		});
	}

	return {
		element: root,
		refreshCameras
	};
}
