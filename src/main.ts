import { CameraManager } from "./camera";
import { FaceTracker } from "./face";
import { ConsoleService } from "./services/consoleService";
import { ConsolePanel } from "./ui/consolePanel";
import "./styles/main.css";
import type { LogLevel } from "./dto/log";

function createUI() {
	const appRoot = document.getElementById("app") || document.body;

	const select = document.createElement("select");
	select.id = "cameraSelect";

	const frame = document.createElement("div");
	frame.id = "frame";

	const video = document.createElement("video");
	video.id = "video";
	video.setAttribute("autoplay", "");
	video.setAttribute("playsinline", "");
	video.muted = true;

	const canvas = document.createElement("canvas");
	canvas.id = "canvas";

	frame.appendChild(video);
	frame.appendChild(canvas);
	appRoot.appendChild(select);
	appRoot.appendChild(frame);

	return { video, canvas, frame, cameraSelect: select };
}

const { video, canvas, frame, cameraSelect } = createUI();

const camera_manager = new CameraManager(video);
const face_tracker = new FaceTracker();
const console_service = new ConsoleService();
const console_panel = new ConsolePanel(console_service);
// exposed for debugging
(window as any).appConsole = console_service;

function hookConsoleToService(service: ConsoleService) {
	const original = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error
	};

	const forward = (level: LogLevel, fn: (...args: unknown[]) => void) => {
		return (...args: unknown[]) => {
			fn(...args);
			service.add(level, ...args);
		};
	};

	console.log = forward("info", original.log);
	console.info = forward("info", original.info);
	console.warn = forward("warn", original.warn);
	console.error = forward("error", original.error);
}

hookConsoleToService(console_service);

async function loadCameras() {
	console.info("Loading cameras...");

	const cameras = await camera_manager.getCameras();

	cameraSelect.innerHTML = "";

	cameras.forEach((cam, index) => {
		const option = document.createElement("option");
		option.value = cam.deviceId;
		option.textContent = cam.label || `Camera ${index + 1}`;
		cameraSelect.appendChild(option);
	});

	if (cameras.length > 0) {
		await camera_manager.start(cameras[0].deviceId);
		console.info("Camera started", cameras[0]);
	} else {
		console.warn("No cameras found.");
	}
  
	cameraSelect.addEventListener("change", async () => {
		await camera_manager.switch(cameraSelect.value);
		console.info("Switched camera", cameraSelect.value);
	});
}

function resizeCanvasDisplay() {
	if (!video.videoWidth || !video.videoHeight) return;

	const horizontalPadding = 32; // body side padding (approx)
	const paddingTop = 20; // matches body top padding
	const paddingBottom = 16; // matches body bottom padding

	const selectRect = cameraSelect.getBoundingClientRect();
	const controlsHeight = selectRect.height || 0;

	// account for margins between elements (roughly 12px each) plus a small buffer
	const verticalGaps = 24; // select margin + buffer

	const maxWidth = Math.max(0, window.innerWidth - horizontalPadding);
	const maxHeight = Math.max(
		0,
		window.innerHeight - (paddingTop + paddingBottom + controlsHeight + verticalGaps)
	);
	const scale = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight);

	const displayWidth = Math.round(video.videoWidth * scale);
	const displayHeight = Math.round(video.videoHeight * scale);

	frame.style.width = `${displayWidth}px`;
	frame.style.height = `${displayHeight}px`;
	canvas.style.width = `${displayWidth}px`;
	canvas.style.height = `${displayHeight}px`;
	canvas.width = displayWidth;
	canvas.height = displayHeight;
}

function handleCanvasClick(event: MouseEvent) {
	const rect = canvas.getBoundingClientRect();
	if (!rect.width || !rect.height) return;
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const x = (event.clientX - rect.left) * scaleX;
	const y = (event.clientY - rect.top) * scaleY;
	face_tracker.toggleSelectionAt(canvas, x, y);
}

async function loop() {
	if (camera_manager.isStreaming()) {
		face_tracker.draw(canvas, video);
	}

	requestAnimationFrame(loop);
}

async function start() {
	await face_tracker.init();
	await loadCameras();
	video.addEventListener("loadedmetadata", resizeCanvasDisplay, { once: true });
	window.addEventListener("resize", resizeCanvasDisplay);
	canvas.addEventListener("click", handleCanvasClick);
	resizeCanvasDisplay();
	loop();
}

start();
