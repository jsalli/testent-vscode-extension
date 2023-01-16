import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { CloseTextEditorArgs, Commands, customCommand } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class CloseTextEditorCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		public documentIsUntitled: boolean,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveCloseTextEditorCodeLens(
	lens: CloseTextEditorCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[CloseTextEditorArgs]>({
		// title: '✖ Close',
		title: 'Close',
		tooltip: `Close${
			lens.documentIsUntitled
				? ' and discard content of this untitled document'
				: ''
		}`,
		command: Commands.CloseTextEditor,
		arguments: [{ fileId: lens.fileId }],
	});
	return lens;
}
