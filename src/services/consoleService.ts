import type { LogEntry, LogEvent, LogLevel, LogEventType, UnreadCounts } from "../dto/log";

type Listener = (event: LogEvent) => void;

export class ConsoleService {
	private logs: LogEntry[];
	private listeners: Set<Listener>;

	constructor() {
		this.logs = [];
		this.listeners = new Set();
	}

	onLogChanged(listener: Listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	add(level: LogLevel, ...args: unknown[]): LogEntry {
		const message = args.map(arg => this.stringifyArg(arg)).join(" ");
		const log: LogEntry = {
			id: this.logs.length,
			level,
			message,
			timestamp: new Date(),
			read: false
		};

		this.logs.push(log);

		this.dispatchOnLogChanged("add", { log });
		return log;
	}

	markRead(id: number) {
		const log = this.logs.find(l => l.id === id);
		if (!log) return;
		this.updateReadState(log, true);
	}

	markUnread(id: number) {
		const log = this.logs.find(l => l.id === id);
		if (!log) return;
		this.updateReadState(log, false);
	}

	private dispatchOnLogChanged(type: LogEventType, payload: { log: LogEntry }) {
		const counts = this.getUnreadCounts();
		const event: LogEvent = { type, counts, ...payload };
		for (const listener of this.listeners) {
			listener(event);
		}
	}	

	private getUnreadCounts(): UnreadCounts {
		const counts: UnreadCounts = { info: 0, warn: 0, error: 0 };
		for (const log of this.logs) {
			if (!log.read) {
				if (log.level === "error") counts.error += 1;
				else if (log.level === "warn") counts.warn += 1;
				else counts.info += 1;
			}
		}
		return counts;
	}

	private updateReadState(log: LogEntry, state: boolean) {
		if (log.read === state) return;
		log.read = state;
		this.dispatchOnLogChanged("update", { log });
	}

	private stringifyArg(value: unknown): string {
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}
}
