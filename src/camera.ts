export class CameraManager {
	private video: HTMLVideoElement;
	private stream: MediaStream | null;
	private currentDeviceId: string | null;

	constructor(video: HTMLVideoElement) {
		if (!video) {
			throw new Error("CameraManager requires a video element");
		}
		
		this.video = video;
		this.stream = null;
		this.currentDeviceId = null;
	}

	async getCameras(): Promise<Array<{ deviceId: string; label: string }>> {
		await navigator.mediaDevices.getUserMedia({ video: true });

		const devices = await navigator.mediaDevices.enumerateDevices();

		return devices
			.filter(device => device.kind === "videoinput")
			.map(device => ({
				deviceId: device.deviceId,
				label: device.label || "Camera"
			}));
  	}

	getResolution(): { width: number; height: number } | null {
		if (!this.video.videoWidth || !this.video.videoHeight) {
			return null;
		}

		return {
			width: this.video.videoWidth,
			height: this.video.videoHeight
		};
	}

	isStreaming(): boolean {
		return this.stream !== null && this.getResolution() !== null;
	}

	async start(deviceId: string | null = null) {
		this.stop();

		const constraints: MediaStreamConstraints = {
			video: deviceId ? {
				deviceId: { exact: deviceId }
			} : true,
			audio: false
		};

		this.stream = await navigator.mediaDevices.getUserMedia(constraints);

		const videoTrack = this.stream.getVideoTracks()[0];
		await this.applyBestConstraints(videoTrack);

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

	async switch(deviceId: string) {
		if (!deviceId || deviceId === this.currentDeviceId) return;
		await this.start(deviceId);
  	}

	private async applyBestConstraints(videoTrack: MediaStreamTrack) {
		if (!videoTrack?.getCapabilities) return;

		const caps = videoTrack.getCapabilities() as MediaTrackCapabilities & {
			width?: { max?: number };
			height?: { max?: number };
			frameRate?: { max?: number };
		};
		const desiredFps = 30;
		const minFps = 30;
		const targetFps = caps.frameRate?.max ? Math.min(desiredFps, caps.frameRate.max) : desiredFps;

		const attemptConstraints = async (width: number, height: number) => {
			const constraint: MediaTrackConstraints = {
				width: { ideal: width, max: width },
				height: { ideal: height, max: height },
				frameRate: { ideal: targetFps, max: targetFps, min: minFps }
			};
			try {
				await videoTrack.applyConstraints(constraint);
				const applied = videoTrack.getSettings?.();
				if (applied) {
					console.log("Camera settings:", applied);
					return applied;
				}
			} catch (err) {
				console.warn("Could not apply constraints:", constraint, err);
			}
			return null;
		};

		let applied: MediaTrackSettings | null = null;
		if (caps.width?.max && caps.height?.max) {
			applied = await attemptConstraints(caps.width.max, caps.height.max);
		}

		const fallbackResolutions = [
			{ width: 1920, height: 1080 },
			{ width: 1280, height: 720 }
		];

		if (applied?.frameRate !== undefined && applied.frameRate < minFps) {
			for (const res of fallbackResolutions) {
				if (
					(!caps.width?.max || caps.width.max >= res.width) &&
					(!caps.height?.max || caps.height.max >= res.height)
				) {
					const fallback = await attemptConstraints(res.width, res.height);
					if (fallback?.frameRate !== undefined && fallback.frameRate >= minFps) {
						applied = fallback;
						break;
					}
				}
			}
		}
	}
}
