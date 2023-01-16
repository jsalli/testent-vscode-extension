import { ChildProcess } from 'child_process';
import { ExtensionMode } from 'vscode';
import { Container } from '../../../../container';
import { Logger } from '../../../../logger';

export function watchRecordingProcessProgress(
	childProcess: ChildProcess,
): Promise<void> {
	let errors: any[] | undefined = undefined;

	return new Promise((res, rej) => {
		// Webpack's Define plugin removes this code in production mode.
		if (PRODUCTION === false) {
			childProcess.stdout?.setEncoding('utf8');
			childProcess.stdout?.on('data', (stdout) => {
				Logger.log(`Recording - Output: ${stdout}`);
			});

			childProcess.stderr?.setEncoding('utf8');
			childProcess.stderr?.on('data', (stderr) => {
				Logger.error(`Recording - Error: ${stderr.toString()}`, undefined, {
					dontSendErrorMessage: true,
					alternativeLogMessage: 'Recording error',
				});
				if (Container.instance.context.extensionMode === ExtensionMode.Test) {
					// Print errors when running tests
					console.log(
						`== Error from node child process:\n${stderr.toString()}\n==`,
					);
				}
				if (errors === undefined) {
					errors = [];
				}
				errors.push(stderr.toString());
			});
		}

		childProcess.on('close', (exitCode): void => {
			switch (exitCode) {
				case null: {
					const message = 'No exit code from recording process';
					Logger.log(message);
					return rej(message);
				}
				case 0: {
					Logger.log(`Recording successful`);
					return res();
				}
				default: {
					const message = `Recording exited with error exit code: ${exitCode}`;
					Logger.log(message);
					return rej(message);
				}
			}
		});

		childProcess.on('error', (error) => {
			Logger.log(`Recording reported an error:\n ${error.message}`);
			if (errors === undefined) {
				errors = [];
			}
			errors.push(error.message);
			return rej(errors);
		});
	});
}
