import { DefaultExport } from '@testent/shared';
import {
	CodePosition,
	defaultExportFunctionName,
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import { SourceFile } from 'typescript';
// import { testableFunctionId } from '../../../utils/utils';
import { ExportAssignmentArrowFunc } from './common';
import { createNotSupportedFunction } from './createNotSupportedFunction';
import { parseArrowFunction } from './parseArrowFunction';

export function testableFuncFromDefaultExportArrowFunc(
	node: ExportAssignmentArrowFunc,
	codePosition: CodePosition,
	languageId: string,
	sourceFile: SourceFile,
	sourceFilePath: string,
): TestableFunction | NotSupportedFunction {
	const functionType = new DefaultExport();
	const name = defaultExportFunctionName;
	// const id = testableFunctionId(sourceFile.fileName, name);
	// const sourceFilePath = normalizePath(sourceFile.fileName);

	try {
		const partialFunc = parseArrowFunction(node.expression, sourceFile);
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
