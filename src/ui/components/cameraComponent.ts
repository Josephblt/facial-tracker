import "../../styles/button.css";
import "../../styles/camera.css";
import template from "../../templates/components/camera-component.html?raw";
import { CameraService } from "../../services/cameraService";

export type CameraComponent = {
	element: HTMLElement;
	setFeed(content: string | Node): void;
	setOverlay(content: string | Node): void;
	setControls(content: string | Node): void;
	setAspectRatio(ratio: string): void;
	setAriaLabel(label: string): void;
};

export type CameraBinding = {
	start(): Promise<void>;
	stop(): void;
	video: HTMLVideoElement;
};

type CameraElements = {
	root: HTMLElement;
	stageEl: HTMLElement;
	feedEl: HTMLElement;
	overlayEl: HTMLElement;
	controlsEl: HTMLElement;
};

const parseCameraTemplate = (templateHtml: string): CameraElements => {
	const view = document.createElement("template");
	view.innerHTML = templateHtml.trim();

	const root = view.content.firstElementChild as HTMLElement | null;
	if (!root) {
		throw new Error("Camera template is missing a root element");
	}

	const stageEl = root.querySelector(".camera__stage") as HTMLElement | null;
	const feedEl = root.querySelector(".camera__feed") as HTMLElement | null;
	const overlayEl = root.querySelector(".camera__overlay") as HTMLElement | null;
	const controlsEl = root.querySelector(".camera__controls") as HTMLElement | null;

	if (!stageEl || !feedEl || !overlayEl || !controlsEl) {
		throw new Error("Camera template is missing required sections");
	}

	return { root, stageEl, feedEl, overlayEl, controlsEl };
};

type CameraOptions = {
	ariaLabel?: string;
	aspectRatio?: string;
	feed?: string | Node;
	overlay?: string | Node;
	controls?: string | Node;
};

type CameraBindingOptions = {
	constraints?: MediaStreamConstraints;
	loadingText?: string;
	formatError?: (error: unknown) => string;
};

const setContent = (element: HTMLElement, content: string | Node) => {
	if (typeof content === "string") {
		element.textContent = content;
	} else {
		element.replaceChildren(content);
	}
};

const parseAspectRatio = (ratio: string): number | null => {
	const normalized = ratio.trim();
	const ratioParts = normalized.split("/");
	if (ratioParts.length === 2) {
		const numerator = Number(ratioParts[0].trim());
		const denominator = Number(ratioParts[1].trim());
		if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
			return numerator / denominator;
		}
	}

	const numeric = Number(normalized);
	if (Number.isFinite(numeric) && numeric > 0) {
		return numeric;
	}

	return null;
};

export function createCameraComponent(options: CameraOptions = {}): CameraComponent {
	const { root, feedEl, overlayEl, controlsEl } = parseCameraTemplate(template);
	let aspectRatioValue = 16 / 9;

	const updateFit = () => {
		const rect = root.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		const containerRatio = rect.width / rect.height;
		const fitWidth = aspectRatioValue >= containerRatio;
		root.classList.toggle("camera--fit-width", fitWidth);
		root.classList.toggle("camera--fit-height", !fitWidth);
	};

	const setFeed = (content: string | Node) => {
		setContent(feedEl, content);
	};

	const setOverlay = (content: string | Node) => {
		setContent(overlayEl, content);
	};

	const setControls = (content: string | Node) => {
		setContent(controlsEl, content);
	};

	const setAspectRatio = (ratio: string) => {
		root.style.setProperty("--camera-aspect-ratio", ratio);
		const parsed = parseAspectRatio(ratio);
		if (parsed) {
			aspectRatioValue = parsed;
		}
		updateFit();
	};

	const setAriaLabel = (label: string) => {
		root.setAttribute("aria-label", label);
	};

	if (options.ariaLabel) {
		setAriaLabel(options.ariaLabel);
	}

	if (options.aspectRatio) {
		setAspectRatio(options.aspectRatio);
	}

	if (options.feed !== undefined) {
		setFeed(options.feed);
	}

	if (options.overlay !== undefined) {
		setOverlay(options.overlay);
	}

	if (options.controls !== undefined) {
		setControls(options.controls);
	}

	root.classList.add("camera--fit-width");

	if (typeof ResizeObserver !== "undefined") {
		const observer = new ResizeObserver(updateFit);
		observer.observe(root);
	} else {
		window.addEventListener("resize", updateFit);
	}

	return {
		element: root,
		setFeed,
		setOverlay,
		setControls,
		setAspectRatio,
		setAriaLabel
	};
}

const formatCameraError = (error: unknown) => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};

export function bindCameraService(
	component: CameraComponent,
	service: CameraService,
	options: CameraBindingOptions = {}
): CameraBinding {
	const status = document.createElement("div");
	status.className = "camera__status";
	component.setOverlay(status);

	const video = document.createElement("video");
	video.autoplay = true;
	video.muted = true;
	video.playsInline = true;
	component.setFeed(video);

	const showStatus = (message: string | null) => {
		status.textContent = message ?? "";
		status.style.display = message ? "flex" : "none";
	};

	const updateAspect = () => {
		if (video.videoWidth && video.videoHeight) {
			component.setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
		}
	};

	const start = async () => {
		showStatus(options.loadingText ?? "Loading camera...");
		try {
			const stream = await service.start(options.constraints);
			video.srcObject = stream;
			video.removeEventListener("loadedmetadata", updateAspect);
			video.removeEventListener("resize", updateAspect);
			video.addEventListener("loadedmetadata", updateAspect, { once: true });
			video.addEventListener("resize", updateAspect);
			await video.play();
			showStatus(null);
		} catch (error) {
			const message = options.formatError?.(error) ?? `Camera unavailable: ${formatCameraError(error)}`;
			showStatus(message);
		}
	};

	const stop = () => {
		video.pause();
		video.srcObject = null;
		video.removeEventListener("resize", updateAspect);
		service.stop();
		showStatus("Camera stopped.");
	};

	showStatus(null);

	return { start, stop, video };
}
