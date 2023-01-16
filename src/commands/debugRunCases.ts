import { Container } from '../container';
import { FileId } from '../languageHandlers/common/fileId';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { ensureActiveEditor } from '../utils/utils';
import { command, Command, Commands } from './common';

export interface DebugRunCasesArgs {
	functionName: string;
	fileId: FileId;
	useCaseIndex?: number;
	// The returnOutputForTest bit is set in testing to assert the output of the function run.
	returnSuccessForTest?: boolean | undefined;
}

export type DebugRunCasesReturn = void;

@command()
export class DebugRunCasesCommand extends Command {
	constructor() {
		super([Commands.DebugOneRunCase]);
	}

	public async execute(args: DebugRunCasesArgs): Promise<DebugRunCasesReturn> {
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
					'DebugRunCases',
					{ languageId: testableFunction.languageId },
					{ numberOfCases: runCaseDataArr.length },
				);

				return JsTsLanguageHandler.debugFunctionWithRunCases(
					testableFunction,
					runCaseDataArr,
					args.returnSuccessForTest,
				);
			}
			// else if (languageId === 'Python') {
			//   Handle Python stuff
			// }

			throw new Error(
				`Unsupported languageId: "${activeEditor.document.languageId}" for debugging run cases`,
			);
		} catch (error) {
			const logMessage = 'Could not execute debugging command';
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
