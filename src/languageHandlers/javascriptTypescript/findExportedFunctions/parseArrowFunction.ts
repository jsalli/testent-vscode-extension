import {
	TestableFunctionArgs,
	TypeNodeSpecifier,
} from '@testent/shared-code-processing';
import {
	ArrowFunction,
	getCombinedModifierFlags,
	ModifierFlags,
	SourceFile,
} from 'typescript';
import { parseFunctionArguments, parseReturn } from './common';

export function parseArrowFunction(
	node: ArrowFunction,
	sourceFile: SourceFile,
): {
	async: boolean;
	generator: boolean;
	args: TestableFunctionArgs[];
	returnValue: TypeNodeSpecifier;
} {
	const async = (getCombinedModifierFlags(node) & ModifierFlags.Async) !== 0;
	const generator = false;
	const args: TestableFunctionArgs[] = parseFunctionArguments(
		node.parameters,
		sourceFile,
	);
	const returnValue = parseReturn(node.type, sourceFile);
	return {
		async,
		generator,
		args,
		returnValue,
	};
}
