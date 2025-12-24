import {
	FaceLandmarker,
	FilesetResolver,
	DrawingUtils
} from "@mediapipe/tasks-vision";

export class FaceTracker {

	constructor() {
		this.landmarker = null;
		this.drawingUtils = null;
		this.context2D = null;
		this.lastFace = null;
		this.selectedIndices = new Set();
	}

	async init() {
		const fileset = await FilesetResolver.forVisionTasks(
			"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
		);

		this.landmarker = await FaceLandmarker.createFromOptions(fileset, {
			baseOptions: {
				modelAssetPath:
					"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
				delegate: "GPU"
			},
			runningMode: "VIDEO",
			numFaces: 1
		});
	}

	detect(video) {
		if (!this.landmarker) return null;
		const landmarks = this.landmarker.detectForVideo(video, performance.now());
		const face_landmarks = landmarks?.faceLandmarks?.[0];
		return face_landmarks ? face_landmarks : null;
	}

	sync_canvas_video(canvas, video) {
		// canvas.width/height are already set in resizeCanvasDisplay; keep them in sync with displayed size.
		const targetWidth = canvas.clientWidth;
		const targetHeight = canvas.clientHeight;
		if (targetWidth && targetHeight) {
			if (canvas.width !== targetWidth) canvas.width = targetWidth;
			if (canvas.height !== targetHeight) canvas.height = targetHeight;
		}
	}

	draw(canvas, video) { 
		if (!canvas || !video) return;

		const face = this.detect(video);
		this.lastFace = face;
		if (!face) return;

		this.sync_canvas_video(canvas, video);

		if (!this.drawingUtils) {
			this.context2D = canvas.getContext("2d");
			this.drawingUtils = new DrawingUtils(this.context2D);
		}

		const context2D = this.context2D;
		context2D.clearRect(0, 0, canvas.width, canvas.height);

		context2D.save();
		const styleFine = { color: "rgba(255,255,255,0.25)", lineWidth: 0.5 };
		const pointStyle = { color: "rgba(0,255,0,0.5)", lineWidth: 0.5, radius: 0.75 };
		context2D.translate(canvas.width, 0);
		context2D.scale(-1, 1);
		context2D.drawImage(video, 0, 0, canvas.width, canvas.height);		
		this.drawingUtils.drawConnectors(face, FaceLandmarker.FACE_LANDMARKS_TESSELATION, styleFine);
		this.drawingUtils.drawLandmarks(face, pointStyle);
		context2D.restore();

		if (this.selectedIndices.size > 0) {
			context2D.save();
			context2D.fillStyle = "rgba(255,0,0,0.9)";
			for (const index of this.selectedIndices) {
				const p = face[index];
				if (!p) continue;
				const x = canvas.width - p.x * canvas.width;
				const y = p.y * canvas.height;
				context2D.beginPath();
				context2D.arc(x, y, 2.5, 0, Math.PI * 2);
				context2D.fill();
			}
			context2D.restore();
		}

		// ctx.save();
		// ctx.fillStyle = "rgba(255,255,0,0.75)";
		// ctx.font = "10px sans-serif";
		// for (let i = 0; i < face.length; i += 1) {
		// 	const p = face[i];
		// 	const x = canvas.width - p.x * canvas.width;
		// 	ctx.fillText(String(i), x, p.y * canvas.height);
		// }
		// ctx.restore();
	}

	toggleSelectionAt(canvas, x, y, maxDistance = 12) {
		if (!this.lastFace || this.lastFace.length === 0) return null;

		const unmirroredX = canvas.width - x;
		let closestIndex = null;
		let closestDistSq = maxDistance * maxDistance;

		for (let i = 0; i < this.lastFace.length; i += 1) {
			const p = this.lastFace[i];
			const px = p.x * canvas.width;
			const py = p.y * canvas.height;
			const dx = px - unmirroredX;
			const dy = py - y;
			const distSq = dx * dx + dy * dy;
			if (distSq <= closestDistSq) {
				closestDistSq = distSq;
				closestIndex = i;
			}
		}

		if (closestIndex === null) return null;

		if (this.selectedIndices.has(closestIndex)) {
			this.selectedIndices.delete(closestIndex);
		} else {
			this.selectedIndices.add(closestIndex);
		}

		return closestIndex;
	}
}
