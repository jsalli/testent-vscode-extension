import { TestableFunction } from '@testent/shared-code-processing';
import { TextDocumentShowOptions, window, workspace } from 'vscode';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { Command, command, Commands } from './common';

export interface OpenRunInputViewArgs {
	testableFunction: TestableFunction;
	showOptions?: TextDocumentShowOptions;
}

export type OpenRunInputViewReturn = void;

@command()
export class OpenRunInputViewCommand extends Command {
	constructor() {
		super(Commands.OpenRunInputView);
	}

	public override dispose(): void {
		super.dispose();
	}

	public async execute(
		args: OpenRunInputViewArgs,
	): Promise<OpenRunInputViewReturn> {
		try {
			if (
				JsTsLanguageHandler.languageIdIsTypeScript(
					args.testableFunction.languageId,
				) ||
				JsTsLanguageHandler.languageIdIsJavaScript(
					args.testableFunction.languageId,
				)
			) {
				const viewContent = JsTsLanguageHandler.createInputViewContent(
					args.testableFunction,
					// args.testableFunction.id,
					'run',
					undefined,
				);

				const document = await workspace.openTextDocument({
					language: args.testableFunction.languageId,
					content: viewContent,
				});

				const showOptions = args.showOptions;
				await window.showTextDocument(document, showOptions);
			}
			// else if (languageId === 'Python') {
			//   Handle Python stuff
			// }
			else {
				throw new Error(
					`Unsupported languageId: "${args.testableFunction.languageId}" for opening run input view`,
				);
			}
		} catch (error) {
			const logMessage = 'Error opening Run Input View';
			Logger.error(error, logMessage);
			let errorToThrow: Error;
			if (PRODUCTION === false) {
				errorToThrow = error;
			} else {
				errorToThrow = new Error(logMessage);
			}
			throw errorToThrow;
		}
	}
}
