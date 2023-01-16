import { CancellationToken, Progress, ProgressLocation, window } from 'vscode';
import { ErrorNotification } from './ErrorNotification';
import {
	NewTestGeneratedNotification,
	TestGenerationError,
	TestGenerationSuccess,
} from './NewTestGeneratedNotification';

export class TestGenerationProgress {
	private progress:
		| Progress<{
				message?: string | undefined;
				increment?: number | undefined;
		  }>
		| undefined;
	private cancelToken: CancellationToken | undefined;
	private endResolve:
		| ((value?: void | PromiseLike<void> | undefined) => void)
		| undefined;

	constructor() {
		void window.withProgress(
			{
				location: ProgressLocation.Window,
				title: 'Generating test...',
				cancellable: true,
			},
			(progress, token) => {
				this.progress = progress;
				this.cancelToken = token;

				this.progress.report({ increment: 0 });

				return new Promise<void>((resolve) => {
					this.endResolve = resolve;
				});
			},
		);
	}

	public addProgress(increment: number, message?: string): void {
		this.progress?.report({
			increment: increment,
			message: message,
		});
	}

	public endProgress(
		successOrError: TestGenerationSuccess | TestGenerationError,
	): void {
		let message: string;
		if ('error' in successOrError) {
			message = 'Error';
			new ErrorNotification(successOrError.error);
		} else {
			message = 'Done';
			new NewTestGeneratedNotification(successOrError);
		}
		this.addProgress(100, message);
		setTimeout(() => {
			this.endResolve?.();
		}, 2000);
	}
}
