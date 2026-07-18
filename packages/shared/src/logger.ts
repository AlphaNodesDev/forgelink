/**
 * A tiny structured logger shared by every ForgeLink process (Builder, Launcher,
 * API, Installer). It writes human-readable lines to the console and, when a
 * sink is attached, forwards structured records so hosts can persist logs to
 * disk (launcher logs, builder logs, API logs, installer logs, download logs).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  data?: Record<string, unknown>;
}

export type LogSink = (record: LogRecord) => void;

export interface LoggerOptions {
  scope: string;
  minLevel?: LogLevel;
  sink?: LogSink;
}

export class Logger {
  private readonly scope: string;
  private minWeight: number;
  private sink?: LogSink;

  constructor(options: LoggerOptions) {
    this.scope = options.scope;
    this.minWeight = LEVEL_WEIGHT[options.minLevel ?? 'info'];
    this.sink = options.sink;
  }

  /** Attach or replace the persistent sink (e.g. a rotating file writer). */
  setSink(sink: LogSink | undefined): void {
    this.sink = sink;
  }

  setMinLevel(level: LogLevel): void {
    this.minWeight = LEVEL_WEIGHT[level];
  }

  /** Create a child logger that shares the sink but narrows the scope. */
  child(subScope: string): Logger {
    const child = new Logger({ scope: `${this.scope}:${subScope}`, sink: this.sink });
    child.minWeight = this.minWeight;
    return child;
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.emit('debug', message, data);
  }
  info(message: string, data?: Record<string, unknown>): void {
    this.emit('info', message, data);
  }
  warn(message: string, data?: Record<string, unknown>): void {
    this.emit('warn', message, data);
  }
  error(message: string, data?: Record<string, unknown>): void {
    this.emit('error', message, data);
  }

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_WEIGHT[level] < this.minWeight) return;
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      scope: this.scope,
      message,
      data,
    };

    const line = `${record.timestamp} [${level.toUpperCase()}] (${this.scope}) ${message}`;
    const consoleArgs = data ? [line, data] : [line];
    if (level === 'error') console.error(...consoleArgs);
    else if (level === 'warn') console.warn(...consoleArgs);
    else console.log(...consoleArgs);

    this.sink?.(record);
  }
}

export function createLogger(scope: string, options?: Omit<LoggerOptions, 'scope'>): Logger {
  return new Logger({ scope, ...options });
}
