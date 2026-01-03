import { ConsoleService } from "./consoleService";

export class CameraService {
	private stream: MediaStream | null = null;
	private logger: ConsoleService | null;

	constructor(logger?: ConsoleService) {
		this.logger = logger ?? null;
	}

	private log(level: "info" | "warn" | "error", message: string) {
		this.logger?.add(level, `[Camera] ${message}`);
	}

	async start(
		constraints: MediaStreamConstraints = { video: { facingMode: "user" }, audio: false }
	): Promise<MediaStream> {
		if (!navigator.mediaDevices?.getUserMedia) {
			const message = "getUserMedia is not supported";
			this.log("error", message);
			throw new Error(message);
		}

		this.stop(true);
		this.log("info", "Requesting camera access.");
		try {
			this.stream = await navigator.mediaDevices.getUserMedia(constraints);
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
