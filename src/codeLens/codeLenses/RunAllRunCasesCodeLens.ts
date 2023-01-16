import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { Commands, customCommand, RunRunCasesArgs } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class RunAllRunCasesCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveRunAllRunCasesCodeLens(
	lens: RunAllRunCasesCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[RunRunCasesArgs]>({
		// title: '▶️ Run all',
		title: 'Run all',
		tooltip: `Run "${lens.functionName}"-function with all input cases`,
		command: Commands.RunAllRunCases,
		arguments: [
			{
				functionName: lens.functionName,
				fileId: lens.fileId,
			},
		],
	});
	return lens;
}
