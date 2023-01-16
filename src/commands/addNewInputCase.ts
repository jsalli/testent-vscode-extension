import { Position } from 'vscode';
import { FileId } from '../languageHandlers/common/fileId';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { ensureActiveEditor, thenableToPromise } from '../utils/utils';
import { command, Command, Commands } from './common';

export interface AddNewInputArgs {
	functionName: string;
	fileId: FileId;
	mode: 'run' | 'test';
}

export type AddNewInputReturn = void;

@command()
export class AddNewInputCaseCommand extends Command {
	constructor() {
		super(Commands.AddNewInputCase);
	}

	async execute(args: AddNewInputArgs): Promise<AddNewInputReturn> {
		try {
			const activeEditor = ensureActiveEditor(args.fileId);
			const document = activeEditor.document;

			let newInput: string | undefined;
			if (
				JsTsLanguageHandler.languageIdIsTypeScript(document.languageId) ||
				JsTsLanguageHandler.languageIdIsJavaScript(document.languageId)
			) {
				newInput = await JsTsLanguageHandler.createNewInputCase(
					args.fileId,
					args.mode,
				);
			} else {
				throw new Error(
					`Unsupported languageId: "${document.languageId}" for adding new input case`,
				);
			}

			if (newInput === undefined) {
				throw new Error(
					'New input was requested but it was not created for some reason',
				);
			}

			const editThenable = activeEditor.edit((editBuilder) => {
				const endOfFile = new Position(document.lineCount - 1, 0);
				editBuilder.insert(endOfFile, newInput as string);
			});
			await thenableToPromise<boolean>(editThenable);
		} catch (error) {
			const logMessage = 'Error adding new input text to file';
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
