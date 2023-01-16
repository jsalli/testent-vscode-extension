import { Container } from '../container';
import { FileId } from '../languageHandlers/common/fileId';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { ensureActiveEditor } from '../utils/utils';
import { command, Command, Commands } from './common';

export interface RunRunCasesArgs {
	functionName: string;
	fileId: FileId;
	useCaseIndex?: number;
	// The returnOutputForTest bit is set in testing to assert the output of the function run.
	returnOutputForTest?: true | undefined;
}

export type RunRunCasesReturn = undefined | string;

@command()
export class RunRunCasesCommand extends Command {
	constructor() {
		super([Commands.RunAllRunCases, Commands.RunOneRunCase]);
	}

	public async execute(args: RunRunCasesArgs): Promise<RunRunCasesReturn> {
		try {
			const activeEditor = ensureActiveEditor(args.fileId);
			if (
				JsTsLanguageHandler.languageIdIsTypeScript(
					activeEditor.document.languageId,
				) ||
				JsTsLanguageHandler.languageIdIsJavaScript(
					activeEditor.document.languageId,
				)
			) {
				const testableFunction =
					await JsTsLanguageHandler.getTestableFunctionByFileId(args.fileId);

				const runCaseDataArr = JsTsLanguageHandler.parseRunInputView(
					activeEditor.document,
					testableFunction,
					args.useCaseIndex,
				);

				Container.instance.telemetryModule.sendTelemetryEvent(
					'RunRunCases',
					{ languageId: testableFunction.languageId },
					{ numberOfCases: runCaseDataArr.length },
				);
				const output = await JsTsLanguageHandler.runFunctionWithRunCases(
					testableFunction,
					runCaseDataArr,
					args.returnOutputForTest,
				);
				return output;
			}
			// else if (languageId === 'Python') {
			//   Handle Python stuff
			// }

			throw new Error(
				`Unsupported languageId: "${activeEditor.document.languageId}" for running run cases`,
			);
		} catch (error) {
			const logMessage = 'Could not execute test runner command';
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
