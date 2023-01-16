import { NotSupportedFunction } from '@testent/shared-code-processing';
import { CancellationToken, CodeLens, Range } from 'vscode';
import {
	Commands,
	customCommand,
	NotSupportedFunctionArgs,
} from '../../commands';

export class ShowNotSupportedFunctionCodeLens extends CodeLens {
	constructor(public notSupportedFunction: NotSupportedFunction, range: Range) {
		super(range);
	}
}

export function resolveShowNotSupportedFunctionCodeLens(
	lens: ShowNotSupportedFunctionCodeLens,
	_token: CancellationToken,
): CodeLens {
	const message =
		lens.notSupportedFunction.longFailReason ??
		lens.notSupportedFunction.shortFailReason;
	const url = lens.notSupportedFunction.githubIssueUrl;
	const functionName = lens.notSupportedFunction.name;
	lens.command = customCommand<[NotSupportedFunctionArgs]>({
		title: lens.notSupportedFunction.shortFailReason,
		tooltip: `Can not create unit test for function "${functionName}" because ${message}. ${
			url ? `See more from ${url}` : ''
		}`,
		command: Commands.NotSupportedFunction,
		arguments: [
			{
				functionName,
				sourceFilePath: lens.notSupportedFunction.sourceFilePath,
				message,
				url,
			},
		],
	});
	return lens;
}
