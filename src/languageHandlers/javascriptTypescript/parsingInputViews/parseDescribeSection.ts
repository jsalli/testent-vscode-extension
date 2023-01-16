import { describeIdentifierName } from '@testent/shared-code-processing';
import {
	createSourceFile,
	Expression,
	forEachChild,
	isIdentifier,
	isStringLiteral,
	isVariableDeclaration,
	Node,
	ScriptTarget,
	SyntaxKind,
} from 'typescript';
import { findDescribeSection } from '../../common/finders/findDescribeSection';

export function parseDescribeSection(documentContent: string): string {
	const describeSectionStr = findDescribeSection(documentContent);

	const tsSourceFile = createSourceFile(
		'',
		describeSectionStr,
		ScriptTarget.Latest,
	);

	let describeTextNode: Expression | undefined;
	function findDescribeTextNode(node: Node) {
		if (
			isVariableDeclaration(node) &&
			isIdentifier(node.name) &&
			node.name.text === describeIdentifierName
		) {
			describeTextNode = node.initializer;
		} else {
			forEachChild(node, findDescribeTextNode);
		}
	}

	forEachChild(tsSourceFile, findDescribeTextNode);

	if (describeTextNode === undefined || !isStringLiteral(describeTextNode)) {
		throw new Error(
			'Could not find description text for "describe"-function' +
				`Expected type "StringLiteral" but got: "${
					describeTextNode === undefined
						? 'undefined'
						: SyntaxKind[describeTextNode.kind]
				}"`,
		);
	}

	return describeTextNode.text;
}
