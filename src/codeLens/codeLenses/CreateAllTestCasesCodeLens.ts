import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { Commands, CreateTestCasesArgs, customCommand } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class CreateAllTestCasesCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveCreateAllTestCasesCodeLens(
	lens: CreateAllTestCasesCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[CreateTestCasesArgs]>({
		title: 'Create all',
		tooltip: `Create all unit test cases for "${lens.functionName}"-function`,
		command: Commands.CreateAllTestCases,
		arguments: [
			{
				functionName: lens.functionName,
				fileId: lens.fileId,
			},
		],
	});
	return lens;
}
