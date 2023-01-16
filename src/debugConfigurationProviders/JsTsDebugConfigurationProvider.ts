import {
	CancellationToken,
	debug,
	DebugConfiguration,
	DebugConfigurationProvider,
	Disposable,
	WorkspaceFolder,
} from 'vscode';
import { Logger } from '../logger';

let readyToListenForDAMessages = false;

export class JsTsDebugConfigurationProvider
	implements DebugConfigurationProvider
{
	private debugAdapterTracker: Disposable | undefined;

	/**
	 * Prepares injecting the name of the test, which has to be debugged, into the `DebugConfiguration`,
	 * This function has to be called before `vscode.debug.startDebugging`.
	 */
	public prepareFunctionRun(
		cwd: string,
		debuggerSuccessCallBack: (debugFinishedSuccessful: boolean) => void,
	) {
		readyToListenForDAMessages = true;

		this.debugAdapterTracker = debug.registerDebugAdapterTrackerFactory('*', {
			createDebugAdapterTracker(debugSession) {
				return {
					onDidSendMessage: (message) => {
						if (!readyToListenForDAMessages) {
							return;
						}
						function isProcessError(message: any): boolean {
							return (
								message.type === 'event' &&
								message.event === 'output' &&
								message.body?.category === 'stderr' &&
								message.body?.output.includes('Process exited with code 1')
							);
						}

						function isAttachingError(message: any): boolean {
							return (
								message.commans === 'attach' &&
								message.type === 'response' &&
								message.success === false
							);
						}

						if (isProcessError(message) || isAttachingError(message)) {
							Logger.error(`Debugging crashed`, undefined, {
								languageId: 'typescript',
							});
							readyToListenForDAMessages = false;
							debuggerSuccessCallBack(false);
						} else if (
							message.type === 'response' &&
							message.command === 'disconnect' &&
							message.success === true
						) {
							readyToListenForDAMessages = false;
							debuggerSuccessCallBack(true);
						}
					},
				};
			},
		});
	}

	public disposeDebugAdapterTracker() {
		this.debugAdapterTracker?.dispose();
	}

	public resolveDebugConfiguration(
		folder: WorkspaceFolder | undefined,
		debugConfiguration: DebugConfiguration,
		token?: CancellationToken,
	): DebugConfiguration {
		return debugConfiguration;
	}

	public provideDebugConfigurations(
		folder: WorkspaceFolder | undefined,
		token?: CancellationToken,
	): DebugConfiguration[] {
		const debugConfiguration: DebugConfiguration = {
			type: 'node',
			name: 'testent-debug-functions',
			internalConsoleOptions: 'openOnSessionStart',
			continueOnAttach: true,
			request: 'attach',
			address: '127.0.0.1',
			port: 9234,
			skipFiles: ['<node_internals>/**', '**/resources/app/out/vs/**'],
			smartStep: true,
			sourceMaps: true,
			trace: true,
		};

		return [debugConfiguration];
	}
}
