import { normalizePath } from '@testent/shared';
import {
	isNodeExported,
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import {
	isArrowFunction,
	isExportAssignment,
	isFunctionDeclaration,
	isVariableStatement,
	Node,
	SourceFile,
	Visitor,
	VisitResult,
} from 'typescript';
import { TextDocument } from 'vscode';
import { Logger } from '../../../logger';
import { getCodePosition } from './common';
import { testableFuncFromDefaultExportArrowFunc } from './testableFuncFromDefaultExportArrowFunc';
import { testableFuncFromFunctionDeclaration } from './testableFuncFromFunctionDeclaration';
import { testableFuncFromNamedExportArrowFunc } from './testableFuncFromNamedExportArrowFunc';

export function findExportedFunctions(
	document: TextDocument,
	sourceFile: SourceFile,
	output: (TestableFunction | NotSupportedFunction)[],
): Visitor {
	return (node: Node): VisitResult<Node> => {
		try {
			if (!isNodeExported(node)) {
				return undefined;
			}

			// export default (...) => {...}
			if (isExportAssignment(node) && isArrowFunction(node.expression)) {
				const startPos = node.getStart(sourceFile);
				const endPos = node.expression.parameters.end;
				const codePosition = getCodePosition(document, startPos, endPos);
				const foundFunc = testableFuncFromDefaultExportArrowFunc(
					node,
					codePosition,
					document.languageId,
					sourceFile,
					normalizePath(document.uri.fsPath),
				);
				output.push(foundFunc);
			}
			// export const myFunc = (...) => {...}
			else if (isVariableStatement(node)) {
				for (const subNode of node.declarationList.declarations) {
					if (
						subNode.initializer !== undefined &&
						isArrowFunction(subNode.initializer)
					) {
						const startPos = subNode.getStart(sourceFile);
						const endPos = subNode.initializer.end;
						const codePosition = getCodePosition(document, startPos, endPos);
						const newFunc = testableFuncFromNamedExportArrowFunc(
							subNode,
							codePosition,
							document.languageId,
							sourceFile,
							normalizePath(document.uri.fsPath),
						);
						output.push(newFunc);
					}
				}
			}
			// export function myFunc(...) {...}
			// export default function(...) {...}
			else if (isFunctionDeclaration(node)) {
				const startPos = node.getStart(sourceFile);
				const endPos = node.parameters.end;
				const codePosition = getCodePosition(document, startPos, endPos);
				const newFunc = testableFuncFromFunctionDeclaration(
					node,
					codePosition,
					document.languageId,
					sourceFile,
					normalizePath(document.uri.fsPath),
				);
				output.push(newFunc);
			}

			return undefined;
		} catch (error: any) {
			const message = 'Error parsing testable functions';
			Logger.error(error, message);
			throw error;
		}
	};
}
