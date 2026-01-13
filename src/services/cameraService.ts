import { ConsoleService } from "./consoleService";

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
	video: { facingMode: "user" },
	audio: false
};

export class CameraService {
	private stream: MediaStream | null = null;
	private logger: ConsoleService | null;
	private constraints: MediaStreamConstraints;

	constructor(logger?: ConsoleService) {
		this.logger = logger ?? null;
		this.constraints = DEFAULT_CONSTRAINTS;
	}

	private log(level: "info" | "warn" | "error", message: string) {
		this.logger?.add(level, `[Camera] ${message}`);
	}

	setConstraints(constraints?: MediaStreamConstraints): void {
		this.constraints = constraints ?? DEFAULT_CONSTRAINTS;
	}

	getSupportedConstraints(): Record<string, boolean> | null {
		if (!navigator.mediaDevices?.getSupportedConstraints) {
			return null;
		}
		return navigator.mediaDevices.getSupportedConstraints() as Record<string, boolean>;
	}

	async listCameras(): Promise<MediaDeviceInfo[] | null> {
		if (!navigator.mediaDevices?.enumerateDevices) {
			return null;
		}
		try {
			return await navigator.mediaDevices.enumerateDevices();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.log("error", `Device enumeration failed: ${message}`);
			throw error;
		}
	}

	onDeviceChange(handler: () => void): (() => void) | null {
		if (!navigator.mediaDevices?.addEventListener) {
			return null;
		}
		navigator.mediaDevices.addEventListener("devicechange", handler);
		return () => navigator.mediaDevices?.removeEventListener("devicechange", handler);
	}

	private getVideoTrack(): MediaStreamTrack | null {
		return this.stream?.getVideoTracks()[0] ?? null;
	}

	getCapabilities(): MediaTrackCapabilities | null {
		const track = this.getVideoTrack();
		if (!track || typeof track.getCapabilities !== "function") {
			return null;
		}
		return track.getCapabilities();
	}

	getSettings(): MediaTrackSettings | null {
		const track = this.getVideoTrack();
		if (!track || typeof track.getSettings !== "function") {
			return null;
		}
		return track.getSettings();
	}

	getActiveDeviceId(): string | null {
		const settings = this.getSettings();
		if (!settings?.deviceId) {
			return null;
		}
		return settings.deviceId;
	}

	canApplyConstraints(): boolean {
		const track = this.getVideoTrack();
		return Boolean(track && typeof track.applyConstraints === "function");
	}

	async applyConstraint(key: string, value: number | string | boolean): Promise<void> {
		const track = this.getVideoTrack();
		if (!track || typeof track.applyConstraints !== "function") {
			return;
		}
		await track.applyConstraints({ [key]: value } as MediaTrackConstraints);
	}

	async start(constraints?: MediaStreamConstraints): Promise<MediaStream> {
		if (!navigator.mediaDevices?.getUserMedia) {
			const message = "getUserMedia is not supported";
			this.log("error", message);
			throw new Error(message);
		}

		if (constraints) {
			this.constraints = constraints;
		}

		this.stop(true);
		this.log("info", "Requesting camera access.");
		try {
			this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
			this.log("info", "Camera stream started.");
			return this.stream;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.log("error", `Camera start failed: ${message}`);
			throw error;
		}
	}

	stop(silent = false): void {
		if (!this.stream) return;
		for (const track of this.stream.getTracks()) {
			track.stop();
		}
		this.stream = null;
		if (!silent) {
			this.log("info", "Camera stream stopped.");
		}
	}

	getStream(): MediaStream | null {
		return this.stream;
	}
}
