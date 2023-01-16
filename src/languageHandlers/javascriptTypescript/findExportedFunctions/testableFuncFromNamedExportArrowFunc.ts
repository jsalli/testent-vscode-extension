import { NamedExport } from '@testent/shared';
import {
	CodePosition,
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import { ArrowFunction, SourceFile, VariableDeclaration } from 'typescript';
// import { testableFunctionId } from '../../../utils/utils';
import { getBindingName } from './common';
import { createNotSupportedFunction } from './createNotSupportedFunction';
import { parseArrowFunction } from './parseArrowFunction';

export function testableFuncFromNamedExportArrowFunc(
	node: VariableDeclaration,
	codePosition: CodePosition,
	languageId: string,
	sourceFile: SourceFile,
	sourceFilePath: string,
): TestableFunction | NotSupportedFunction {
	const functionType = new NamedExport();
	const name = getBindingName(node.name);
	// const id = testableFunctionId(sourceFile.fileName, name);
	// const sourceFilePath = normalizePath(sourceFile.fileName);

	try {
		const partialFunc = parseArrowFunction(
			node.initializer! as ArrowFunction, // TODO: fix type to have initializer as ArrowFunction
			sourceFile,
		);

		const newFunc = new TestableFunction({
			// id,
			...partialFunc,
			functionType,
			name,
			codePosition,
			sourceFilePath,
			languageId: languageId,
		});
		return newFunc;
	} catch (error) {
		return createNotSupportedFunction(error, {
			// id,
			name,
			functionType,
			codePosition,
			sourceFilePath,
			languageId: languageId,
		});
	}
}
