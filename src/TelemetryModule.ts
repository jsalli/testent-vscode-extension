import TelemetryReporter, {
	TelemetryEventMeasurements,
	TelemetryEventProperties,
} from '@vscode/extension-telemetry';
import {
	ConfigurationChangeEvent,
	Disposable,
	env,
	ExtensionMode,
	extensions,
} from 'vscode';
import { configuration } from './configuration';
import { publisherName, vscodeUniqueExtensionID } from './constants';
import { Container } from './container';

export interface TelemetryPropsWhenSensitiveErrorMsg {
	dontSendErrorMessage: boolean;
	alternativeLogMessage: string;
	telemetryProps?: TelemetryEventProperties;
}

export type { TelemetryEventProperties };

export type TelemetryPropsForError =
	| TelemetryPropsWhenSensitiveErrorMsg
	| TelemetryEventProperties
	| undefined;

export interface ExceptionProps {
	failedMethod: string;
	exceptionType: string;
	exceptionMessage: string;
	logMessage: string;
	[key: string]: string;
}

export class TelemetryModule implements Disposable {
	private _disposable: Disposable | undefined;
	private telemetryReporter: TelemetryReporter | undefined;
	// This is used to block further telemetry sending before the "TelemetryDisabled" event is sent and telemetryReporter is disposed
	private telemetryIsEnabled: boolean = true;

	constructor(private container: Container) {
		env.onDidChangeTelemetryEnabled((telemetryEnabled) => {
			if (telemetryEnabled) {
				this.telemetryIsEnabled = true;
				this.enableTelemetryReporter();
			} else {
				this.telemetryIsEnabled = false;
				this.disableTelemetryReporter();
			}
		});

		if (!env.isTelemetryEnabled) {
			return;
		}

		this.telemetryIsEnabled = true;
		this.enableTelemetryReporter();
	}

	public sendTelemetryEvent(
		eventName: string,
		properties?: TelemetryEventProperties,
		measurements?: TelemetryEventMeasurements,
	): void {
		if (!this.telemetryIsEnabled || this.prodCodeInTestMode()) {
			return;
		}

		this.telemetryReporter?.sendTelemetryEvent(
			eventName,
			properties,
			measurements,
		);
	}

	public sendTelemetryErrorEvent(
		eventName: string,
		properties?: TelemetryEventProperties,
		measurements?: TelemetryEventMeasurements,
	): void {
		if (!this.telemetryIsEnabled || this.prodCodeInTestMode()) {
			return;
		}

		this.telemetryReporter?.sendTelemetryErrorEvent(
			eventName,
			properties,
			measurements,
		);
	}

	public sendTelemetryException(
		error: Error | undefined,
		logMessage: string | undefined,
		alternativeErrorMessage?: string | undefined,
		properties?: TelemetryEventProperties | undefined,
		measurements?: TelemetryEventMeasurements | undefined,
	) {
		if (!this.telemetryIsEnabled || this.prodCodeInTestMode()) {
			return;
		}

		const props: ExceptionProps = {
			...properties,
			failedMethod:
				error != null ? this.stripFailedMethodNameFromStack(error) : 'N/A',
			exceptionType: error != null ? error.constructor.name : 'N/A',
			exceptionMessage:
				alternativeErrorMessage ?? (error != null ? error.message : 'N/A'),
			logMessage: logMessage ? logMessage : '',
		};

		this.telemetryReporter?.sendTelemetryErrorEvent(
			'Exception',
			props,
			measurements,
		);
	}

	public dispose() {
		this._disposable?.dispose();
	}

	private enableTelemetryReporter(): void {
		if (this.telemetryReporter != null) {
			return;
		}
		this.telemetryIsEnabled = true;

		// Webpack Define plugin sets the APPINSIGHTSKEY variable
		const appinsightsKey = APPINSIGHTSKEY;
		const extensionId = vscodeUniqueExtensionID;
		const extension = extensions.getExtension(extensionId)!;
		const extensionVersion = extension.packageJSON.version;

		this.telemetryReporter = new TelemetryReporter(
			extensionId,
			extensionVersion,
			appinsightsKey,
			true,
			[{ lookup: new RegExp('stack'), replacementString: 'REDACTED' }],
		);

		this._disposable = Disposable.from(
			this.container.onReady(this.onReady, this),
			configuration.onDidChange(this.onConfigurationChanged, this),
		);
	}

	private disableTelemetryReporter(): void {
		if (this.telemetryReporter == null) {
			return;
		}
		this.sendTelemetryEvent('TelemetryDisabled');
		this.telemetryIsEnabled = false;
		// Make sure the 'TelemetryDisabled' event goes through before disposing the telemetryReporter
		setTimeout(async () => {
			await this.telemetryReporter?.dispose();
			this.telemetryReporter = undefined;
		}, 2000);
	}

	private onReady(): void {
		this.onConfigurationChanged();
	}

	private onConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (!e?.affectsConfiguration(`${publisherName}.telemetry.enabled`)) {
			return;
		}
		const telemetryEnabled = configuration.get('telemetry.enabled');

		if (telemetryEnabled) {
			if (this.telemetryReporter != null) {
				return;
			}
			this.enableTelemetryReporter();
		} else {
			this.disableTelemetryReporter();
		}
	}

	private stripFailedMethodNameFromStack(error: Error): string {
		const methodNameMatcher = /.*\s*?at\s(.+?)\s/;
		const firstErrorLine = error.stack?.split('\n')[1];
		if (!firstErrorLine) {
			return 'Could not extract failed method name';
		}
		const failedMethodName = firstErrorLine.match(methodNameMatcher)?.[1];
		if (!failedMethodName) {
			return 'Could not extract failed method name';
		}
		return failedMethodName;
	}

	private prodCodeInTestMode(): boolean {
		// Production mode code is used in test mode or development mode of extension. This means we are most likely
		// executing E2E tests or debugging the code. Do not send production telemetrics.
		if (
			PRODUCTION === true &&
			(this.container.context.extensionMode === ExtensionMode.Test ||
				this.container.context.extensionMode === ExtensionMode.Development)
		) {
			return true;
		}
		return false;
	}
}
