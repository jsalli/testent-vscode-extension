import { DefaultExport, NamedExport } from '@testent/shared';
import {
	CodePosition,
	defaultExportFunctionName,
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import {
	FunctionDeclaration,
	getCombinedModifierFlags,
	ModifierFlags,
	SourceFile,
} from 'typescript';
// import { testableFunctionId } from '../../../utils/utils';
import { createNotSupportedFunction } from './createNotSupportedFunction';
import { parseFunctionDeclaration } from './parseFunctionDeclaration';

export function testableFuncFromFunctionDeclaration(
	node: FunctionDeclaration,
	codePosition: CodePosition,
	languageId: string,
	sourceFile: SourceFile,
	sourceFilePath: string,
): TestableFunction | NotSupportedFunction {
	const functionType = getFunctionType(node);
	const name =
		node.name !== undefined ? node.name.text : defaultExportFunctionName;
	// const id = testableFunctionId(sourceFile.fileName, name);
	// const sourceFilePath = normalizePath(sourceFile.fileName);

	try {
		const partialFunc = parseFunctionDeclaration(node, sourceFile);
		const newFunc = new TestableFunction({
			// id,
			...partialFunc,
			name,
			functionType,
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

function getFunctionType(
	node: FunctionDeclaration,
): DefaultExport | NamedExport {
	const defaultExport =
		(getCombinedModifierFlags(node) & ModifierFlags.Default) !== 0;
	const functionType = defaultExport ? new DefaultExport() : new NamedExport();
	return functionType;
}
