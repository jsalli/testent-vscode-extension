import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { Commands, customCommand, RunRunCasesArgs } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class RunOneRunCaseCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		public useCaseIndex: number,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveRunOneRunCaseCodeLens(
	lens: RunOneRunCaseCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[RunRunCasesArgs]>({
		// title: '▶️ Run this',
		title: 'Run this',
		tooltip: `Run the "${lens.functionName}"-function with below input case`,
		command: Commands.RunOneRunCase,
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
