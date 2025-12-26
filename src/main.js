import { CameraManager } from "./camera.js";
import { FaceTracker } from "./face.js";
import { GlobalConsole } from "./console.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const frame = document.getElementById("frame");
const cameraSelect = document.getElementById("cameraSelect");

const camera_manager = new CameraManager(video);
const face_tracker = new FaceTracker();
const app_console = new GlobalConsole();
window.appConsole = app_console;

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

function handleCanvasClick(event) {
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
