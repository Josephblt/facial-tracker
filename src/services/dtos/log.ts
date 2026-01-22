export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
	id: number;
	level: LogLevel;
	message: string;
	timestamp: Date;
	read: boolean;
}

export type LogEventType = "add" | "update";

export interface LogEvent {
	type: LogEventType;
	log: LogEntry;
	counts: UnreadCounts;
}

export interface UnreadCounts {
	info: number;
	warn: number;
	error: number;
}
