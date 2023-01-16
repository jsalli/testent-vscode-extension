import { TestableFunction } from '@testent/shared-code-processing';
import { CancellationToken, CodeLens, Range, ViewColumn } from 'vscode';
import { Commands, customCommand, OpenRunInputViewArgs } from '../../commands';

export class OpenRunInputViewCodeLens extends CodeLens {
	constructor(public testableFunction: TestableFunction, range: Range) {
		super(range);
	}
}

export function resolveOpenRunInputViewCodeLens(
	lens: OpenRunInputViewCodeLens,
	_token: CancellationToken,
): CodeLens {
	lens.command = customCommand<[OpenRunInputViewArgs]>({
		// title: '▶️ Run or 🐛 Debug Function',
		title: 'Run or Debug Function',
		tooltip: `Run or debug function "${
			lens.testableFunction.name !== undefined
				? lens.testableFunction.name
				: 'default export'
		}" with custom inputs`,
		command: Commands.OpenRunInputView,
		arguments: [
			{
				testableFunction: lens.testableFunction,
				showOptions: {
					viewColumn: ViewColumn.Beside,
				},
			},
		],
	});
	return lens;
}
