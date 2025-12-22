const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let faceDetector = null;
let lastResult = null;
let isDetecting = false;

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  video.srcObject = stream;

  video.onloadedmetadata = async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setupFaceDetection();
    draw();
    detectionLoop();
  };
}

function setupFaceDetection() {
  faceDetector = new FaceDetection({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
  });

  faceDetector.setOptions({
    model: "short",
    minDetectionConfidence: 0.7
  });

  faceDetector.onResults((results) => {
    lastResult = results;
    isDetecting = false;
  });
}

/**
 * Runs face detection at a controlled rate (~10 FPS)
 * NEVER overlaps calls
 */
async function detectionLoop() {
  if (!faceDetector || isDetecting) {
    setTimeout(detectionLoop, 100);
    return;
  }

  isDetecting = true;

  try {
    await faceDetector.send({ image: video });
  } catch (err) {
    console.error("Face detection error:", err);
    isDetecting = false;
  }

  setTimeout(detectionLoop, 100);
}

function draw() {
  ctx.save();

  // Mirror image
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.restore();

  drawFaceBox();

  requestAnimationFrame(draw);
}

function drawFaceBox() {
  if (!lastResult || !lastResult.detections?.length) return;

  const detection = lastResult.detections[0];
  const box = detection.boundingBox;

  const w = box.width * canvas.width;
  const h = box.height * canvas.height;

  const x =
    canvas.width -
    (box.xCenter * canvas.width + w / 2);
  const y =
    box.yCenter * canvas.height - h / 2;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}

startCamera();
