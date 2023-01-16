import {
	commands,
	Position,
	Range,
	TextEdit,
	workspace,
	WorkspaceEdit,
} from 'vscode';
import { FileId } from '../languageHandlers/common/fileId';
import { Logger } from '../logger';
import { ensureActiveEditor } from '../utils/utils';
import { command, Command, Commands } from './common';

export interface CloseTextEditorArgs {
	fileId: FileId;
}

export type CloseTextEditorReturn = void;

@command()
export class CloseTextEditorCommand extends Command {
	constructor() {
		super(Commands.CloseTextEditor);
	}

	async execute(args: CloseTextEditorArgs): Promise<CloseTextEditorReturn> {
		try {
			const activeEditor = ensureActiveEditor(args.fileId);
			const document = activeEditor.document;
			if (document.isUntitled) {
				const textEdits: TextEdit[] = [];
				textEdits.push(
					TextEdit.replace(
						new Range(new Position(0, 0), new Position(9999, 0)),
						'',
					),
				);

				const workEdits = new WorkspaceEdit();
				workEdits.set(document.uri, textEdits);
				await workspace.applyEdit(workEdits);
			}

			await commands.executeCommand('workbench.action.closeActiveEditor');
		} catch (error) {
			const logMessage = 'Error closing active editor';
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
