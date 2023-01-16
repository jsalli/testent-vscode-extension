import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { Commands, CreateTestCasesArgs, customCommand } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class CreateOneTestCaseCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		public testCaseIndex: number,
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveCreateOneTestCaseCodeLens(
	lens: CreateOneTestCaseCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[CreateTestCasesArgs]>({
		title: 'Create this',
		tooltip: `Create unit test with the input(s) below for the "${lens.functionName}"-function`,
		command: Commands.CreateOneTestCase,
		arguments: [
			{
				functionName: lens.functionName,
				fileId: lens.fileId,
				testCaseIndex: lens.testCaseIndex,
			},
		],
	});
	return lens;
}
