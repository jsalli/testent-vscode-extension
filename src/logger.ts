import { capitalizeFirstLetter } from '@testent/shared';
import {
	ExtensionContext,
	ExtensionMode,
	OutputChannel,
	Uri,
	window,
} from 'vscode';
import { OutputLevel } from './configuration';
import { Container } from './container';
import {
	TelemetryEventProperties,
	TelemetryPropsForError,
	TelemetryPropsWhenSensitiveErrorMsg,
} from './TelemetryModule';

const emptyStr = '';
const outputChannelName = 'Testent';
const consolePrefix = '[Testent]';

export enum LogLevel {
	Off = 'off',
	Error = 'error',
	Warn = 'warn',
	Info = 'info',
	Debug = 'debug',
}

const enum OrderedLevel {
	Off = 0,
	Error = 1,
	Warn = 2,
	Info = 3,
	Debug = 4,
}

export class Logger {
	private static output: OutputChannel | undefined;

	static configure(context: ExtensionContext, outputLevel: OutputLevel) {
		this._isDevelopment = context.extensionMode === ExtensionMode.Development;
		this.logLevel = outputLevel;
	}

	static enabled(level: LogLevel): boolean {
		return this.orderderLogLevel >= toOrderedLevel(level);
	}

	private static _isDevelopment: boolean;
	static get isDevelopment() {
		return this._isDevelopment;
	}

	private static orderderLogLevel: OrderedLevel = OrderedLevel.Off;
	private static _logLevel: LogLevel = LogLevel.Off;
	static get logLevel(): LogLevel {
		return this._logLevel;
	}
	static set logLevel(value: LogLevel | OutputLevel) {
		this._logLevel = fromOutputLevel(value);
		this.orderderLogLevel = toOrderedLevel(this._logLevel);

		if (value === LogLevel.Off) {
			this.output?.dispose();
			this.output = undefined;
		} else {
			this.output =
				this.output ?? window.createOutputChannel(outputChannelName);
		}
	}

	static debug(message: string, ...params: any[]): void {
		if (this.orderderLogLevel < OrderedLevel.Debug && !this.isDevelopment) {
			return;
		}

		if (this.isDevelopment) {
			console.log(
				this.logPrefix(LogLevel.Debug, true),
				message ?? emptyStr,
				...params,
			);
		}

		if (this.output == null || this.orderderLogLevel < OrderedLevel.Debug) {
			return;
		}
		this.output.appendLine(
			`${this.logPrefix(LogLevel.Debug)} ${
				message ?? emptyStr
			}${this.toLoggableParams(true, params)}`,
		);
	}

	/**
	 * Be sure to not send sensitive information with telemetry
	 *
	 * @param errorOrMessage
	 * @param message
	 * @param telemetricsProperties
	 * @param params
	 * @returns
	 */
	static error(
		errorOrMessage: Error | string,
		message?: string,
		telemetricsProperties?: TelemetryPropsForError,
		...params: any[]
	): void {
		if (message == null) {
			const stack =
				errorOrMessage instanceof Error ? errorOrMessage.stack : undefined;
			if (stack) {
				const match = /.*\s*?at\s(.+?)\s/.exec(stack);
				if (match != null) {
					message = match[1];
				}
			}
		}

		this.sendErrorTelemetrics(errorOrMessage, message, telemetricsProperties);

		if (this.orderderLogLevel < OrderedLevel.Error && !this.isDevelopment) {
			return;
		}

		if (this.isDevelopment) {
			console.error(
				this.logPrefix(LogLevel.Error, true),
				message ?? emptyStr,
				...params,
				errorOrMessage,
			);
		}

		if (this.output == null || this.orderderLogLevel < OrderedLevel.Error) {
			return;
		}
		this.output.appendLine(
			`${this.logPrefix(LogLevel.Error)} ${
				message ?? emptyStr
			}${this.toLoggableParams(false, params)}\n${String(errorOrMessage)}`,
		);
	}

	static log(message: string, ...params: any[]): void {
		if (this.orderderLogLevel < OrderedLevel.Info && !this.isDevelopment) {
			return;
		}

		if (this.isDevelopment) {
			console.log(
				this.logPrefix(LogLevel.Info, true),
				message ?? emptyStr,
				...params,
			);
		}

		if (this.output == null || this.orderderLogLevel < OrderedLevel.Info) {
			return;
		}
		this.output.appendLine(
			`${this.logPrefix(LogLevel.Info)} ${
				message ?? emptyStr
			}${this.toLoggableParams(false, params)}`,
		);
	}

	static logWithDebugParams(message: string, ...params: any[]): void {
		if (this.orderderLogLevel < OrderedLevel.Info && !this.isDevelopment) {
			return;
		}

		if (this.isDevelopment) {
			console.log(
				this.logPrefix(LogLevel.Debug, true),
				message ?? emptyStr,
				...params,
			);
		}

		if (this.output == null || this.orderderLogLevel < OrderedLevel.Info) {
			return;
		}
		this.output.appendLine(
			`${this.logPrefix(LogLevel.Debug)} ${
				message ?? emptyStr
			}${this.toLoggableParams(true, params)}`,
		);
	}

	static warn(message: string, ...params: any[]): void {
		if (this.orderderLogLevel < OrderedLevel.Warn && !this.isDevelopment) {
			return;
		}

		if (this.isDevelopment) {
			console.warn(
				this.logPrefix(LogLevel.Warn, true),
				message ?? emptyStr,
				...params,
			);
		}

		if (this.output == null || this.orderderLogLevel < OrderedLevel.Warn) {
			return;
		}
		this.output.appendLine(
			`${this.logPrefix(LogLevel.Warn)} ${
				message ?? emptyStr
			}${this.toLoggableParams(false, params)}`,
		);
	}

	static toLoggable(
		p: any,
		sanitize?: ((key: string, value: any) => any) | undefined,
	) {
		if (typeof p !== 'object') return String(p);
		if (p instanceof Uri) return `Uri(${p.toString(true)})`;

		try {
			return JSON.stringify(p, sanitize);
		} catch {
			return '<error>';
		}
	}

	private static sendErrorTelemetrics(
		errorOrMessage: Error | string,
		message?: string,
		telemetricsProperties?: TelemetryPropsForError,
	): void {
		let alternativeErrorMessage: string | undefined;
		if (typeof errorOrMessage === 'string') {
			message = errorOrMessage;
		}

		let telemetricsPropsToSend: TelemetryEventProperties | undefined;
		if (
			telemetricsProperties != null &&
			'dontSendErrorMessage' in telemetricsProperties &&
			telemetricsProperties.dontSendErrorMessage === true
		) {
			message = 'Contains sensitive information, original message overridden';
			alternativeErrorMessage = telemetricsProperties.alternativeLogMessage;
			telemetricsPropsToSend = (
				telemetricsProperties as TelemetryPropsWhenSensitiveErrorMsg
			).telemetryProps;
		} else {
			telemetricsPropsToSend =
				telemetricsProperties as TelemetryEventProperties;
		}

		let errorToSend: Error | undefined = undefined;
		if (errorOrMessage instanceof Error) {
			errorToSend = errorOrMessage;
		}
		Container.instance.telemetryModule.sendTelemetryException(
			errorToSend,
			message,
			alternativeErrorMessage,
			telemetricsPropsToSend,
		);
	}

	/**
	 * Create log prefix: [Debug - 10:14:40.458] or [Testent][Debug - 10:14:40.458]
	 */
	private static logPrefix(
		logType: LogLevel,
		consoleLog: boolean = false,
	): string {
		return `${consoleLog ? consolePrefix : ''}[${capitalizeFirstLetter(
			logType,
		)} - ${this.timestamp}]`;
	}

	/**
	 * Time in format 09:34:07.009. Hours, minutes and seconds with 2 digits. Milliseconds with 3 digits.
	 */
	private static get timestamp(): string {
		const now = new Date();
		const hours = `0${now.getHours()}`.slice(-2);
		const minutes = `0${now.getMinutes()}`.slice(-2);
		const seconds = `0${now.getSeconds()}`.slice(-2);
		const milliseconds = `00${now.getMilliseconds()}`.slice(-3);

		return `${hours}:${minutes}:${seconds}.${milliseconds}`;
	}

	private static toLoggableParams(debugOnly: boolean, params: any[]) {
		if (
			params.length === 0 ||
			(debugOnly &&
				this.orderderLogLevel < OrderedLevel.Debug &&
				!this.isDevelopment)
		) {
			return emptyStr;
		}

		const loggableParams = params.map((p) => this.toLoggable(p)).join(', ');
		return loggableParams.length !== 0 ? ` \u2014 ${loggableParams}` : emptyStr;
	}
}

function fromOutputLevel(level: LogLevel | OutputLevel): LogLevel {
	switch (level) {
		case OutputLevel.Silent:
			return LogLevel.Off;
		case OutputLevel.Errors:
			return LogLevel.Error;
		case OutputLevel.Verbose:
			return LogLevel.Info;
		case OutputLevel.Debug:
			return LogLevel.Debug;
		default:
			return level;
	}
}

function toOrderedLevel(logLevel: LogLevel): OrderedLevel {
	switch (logLevel) {
		case LogLevel.Off:
			return OrderedLevel.Off;
		case LogLevel.Error:
			return OrderedLevel.Error;
		case LogLevel.Warn:
			return OrderedLevel.Warn;
		case LogLevel.Info:
			return OrderedLevel.Info;
		case LogLevel.Debug:
			return OrderedLevel.Debug;
		default:
			return OrderedLevel.Off;
	}
}
