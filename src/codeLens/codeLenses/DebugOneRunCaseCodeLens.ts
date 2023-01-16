import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { Commands, customCommand, RunRunCasesArgs } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class DebugOneRunCaseCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		public useCaseIndex: number,
		public documentIsUntitled: boolean,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveDebugOneRunCaseCodeLens(
	lens: DebugOneRunCaseCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[RunRunCasesArgs]>({
		// title: '🐛 Debug this',
		title: 'Debug this',
		tooltip: `Debug the "${
			lens.functionName
		}"-function with below input case. ${
			lens.documentIsUntitled === true ? 'Document must be saved first' : ''
		}`,
		command: Commands.DebugOneRunCase,
		arguments: [
			{
				functionName: lens.functionName,
				fileId: lens.fileId,
				useCaseIndex: lens.useCaseIndex,
			},
		],
	});
	return lens;
}
