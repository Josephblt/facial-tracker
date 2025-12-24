import { CameraManager } from "./camera.js";
import { FaceTracker } from "./face.js";


const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const frame = document.getElementById("frame");
const status = document.getElementById("status");
const cameraSelect = document.getElementById("cameraSelect");

const camera_manager = new CameraManager(video);
const face_tracker = new FaceTracker();

async function loadCameras() {
  	status.textContent = "Loading cameras…";

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
			status.textContent = "Camera started.";
	} else {
			status.textContent = "No cameras found.";
	}
  
	cameraSelect.addEventListener("change", async () => {
		status.textContent = "Switching camera…";
		await camera_manager.switch(cameraSelect.value);
		status.textContent = "Camera started.";
	});
}

function resizeCanvasDisplay() {
	if (!video.videoWidth || !video.videoHeight) return;

	const frameRect = frame.getBoundingClientRect();
	const maxWidth = frameRect.width;
	const maxHeight = frameRect.height;
	const scale = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight);

	canvas.style.width = `${Math.round(video.videoWidth * scale)}px`;
	canvas.style.height = `${Math.round(video.videoHeight * scale)}px`;
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
