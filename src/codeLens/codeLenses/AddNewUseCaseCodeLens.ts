import { CancellationToken, CodeLens, Command, Range } from 'vscode';
import { AddNewInputArgs, Commands, customCommand } from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';

export class AddNewUseCaseCodeLens extends CodeLens {
	constructor(
		range: Range,
		public functionName: string,
		public fileId: FileId,
		public mode: 'run' | 'test',
		command?: Command | undefined,
	) {
		super(range, command);
	}
}

export function resolveAddNewUseCaseCodeLens(
	lens: AddNewUseCaseCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[AddNewInputArgs]>({
		title: `+ Add new ${lens.mode} case`,
		tooltip: `Add new ${lens.mode} case for "${lens.functionName}"-function`,
		command: Commands.AddNewInputCase,
		arguments: [
			{
				functionName: lens.functionName,
				fileId: lens.fileId,
				mode: `${lens.mode}`,
			},
		],
	});
	return lens;
}
