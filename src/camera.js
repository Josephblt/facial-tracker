export class CameraManager {

	constructor(video) {
		if (!video) {
			throw new Error("CameraManager requires a video element");
		}
		
		this.video = video;
		this.stream = null;
		this.deviceId = null;
	}

	async getCameras() {
    await navigator.mediaDevices.getUserMedia({ video: true });

    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices
		.filter(device => device.kind === "videoinput")
		.map(device => ({
			deviceId: device.deviceId,
			label: device.label || "Camera"
    	}));
  	}

	getResolution() {
		if (!this.video.videoWidth || !this.video.videoHeight) {
			return null;
		}

		return {
			width: this.video.videoWidth,
			height: this.video.videoHeight
		};
	}

	isStreaming() {
		return this.stream !== null && this.getResolution() !== null;
	}

	async start(deviceId = null) {
		this.stop()

		const constraints = {
			video: deviceId ? { 
				deviceId: { exact: deviceId } 
			} : true,
			audio: false
		};

    	this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    	this.video.srcObject = this.stream;
    	
		await this.video.play();
		this.currentDeviceId = deviceId;
  	}

	stop() {
		if (this.stream) {
			this.stream.getTracks().forEach(track => track.stop());
			this.stream = null;
		}
	}

	async switch(deviceId) {
		if (!deviceId || deviceId === this.currentDeviceId) return;
		await this.start(deviceId);
  	}
}
