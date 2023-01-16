import {
	addSingleLineComment,
	createVariableStatement,
	ioViewIdentifierPostFix,
	TestableFunctionArgs,
} from '@testent/shared-code-processing';
import { factory, Node, SyntaxKind, TypeNode } from 'typescript';
import { createDefaultValue } from './createDefaultValue';

export function createInputsSection(
	args: TestableFunctionArgs[],
	useCaseId: string,
): Node[] {
	const inputNodes: Node[] = [];
	for (const arg of args) {
		let inputType: TypeNode | undefined;
		if (arg.type?.typeNode !== undefined) {
			const input = args.find((funcArg) => funcArg.name === arg.name)!;
			if (input.optional === true) {
				const optionalType = factory.createUnionTypeNode([
					arg.type.typeNode,
					factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword),
				]);
				inputType = optionalType;
			} else {
				inputType = arg.type?.typeNode;
			}
		} else {
			inputType = undefined;
		}

		const { defaultValue, valueAsString } = createDefaultValue(inputType);

		const argNode = createVariableStatement(
			`${arg.name}${ioViewIdentifierPostFix}${useCaseId}`,
			defaultValue,
			inputType,
		);

		addSingleLineComment(argNode, `FILL THIS (default value ${valueAsString})`);

		inputNodes.push(argNode);
	}
	return inputNodes;
}
