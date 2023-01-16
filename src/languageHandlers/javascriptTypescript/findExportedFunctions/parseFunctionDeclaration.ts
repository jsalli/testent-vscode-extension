import {
	TestableFunctionArgs,
	TypeNodeSpecifier,
} from '@testent/shared-code-processing';
import {
	FunctionDeclaration,
	getCombinedModifierFlags,
	ModifierFlags,
	SourceFile,
	SyntaxKind,
} from 'typescript';
import { parseFunctionArguments, parseReturn } from './common';

export function parseFunctionDeclaration(
	node: FunctionDeclaration,
	sourceFile: SourceFile,
): {
	async: boolean;
	generator: boolean;
	args: TestableFunctionArgs[];
	returnValue: TypeNodeSpecifier;
} {
	const async = (getCombinedModifierFlags(node) & ModifierFlags.Async) !== 0;
	const generator =
		node.asteriskToken !== undefined
			? node.asteriskToken.kind === SyntaxKind.AsteriskToken
			: false;
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
