import * as assert from 'assert';
import { join, parse } from 'path';
import { TextEditor } from 'vscode';
import { ensureActiveEditor } from '../../../../../utils/utils';
import { getTestProjectRootPath } from '../../../../utils/fileUtils';
import {
	closeAllOpenTextDocuments,
	openSourceFileAndInputView,
} from '../../../../utils/viewUtils';
import { ensureJavascriptRunInputViewCodeLenses } from './ensureJavascriptRuntInputViewCodeLenses';
import { ensureTypescriptRunInputViewCodeLenses } from './ensureTypescriptRuntInputViewCodeLenses';
import { ensureTypescriptTestInputViewCodeLenses } from './ensureTypescriptTestInputViewCodeLenses';
import { getExpectedContent } from './getExpectedContent';
/**
 * Expects the source file to have one testable function and thus generates 9 code lenses to the ioView
 */
export const inputViewCreation = {
	name(
		inputViewType: 'run' | 'test',
		testWorkspaceFixtureName: string,
		functionName: string,
	): string {
		return `Testing opening ${inputViewType} input view 1 for ${testWorkspaceFixtureName} - ${functionName}`;
	},
	callback(
		testWorkspaceFixtureName: string,
		srcFileFolderPathRelToTestProjectRoot: string,
		srcFileName: string,
		functionName: string,
		inputViewType: 'run' | 'test',
	): () => Promise<void> {
		return async () => {
			let languageId: 'typescript' | 'javascript';
			if (srcFileName.endsWith('.ts')) {
				languageId = 'typescript';
			} else if (
				srcFileName.endsWith('.js') ||
				srcFileName.endsWith('.cjs') ||
				srcFileName.endsWith('.mjs')
			) {
				languageId = 'javascript';
			} else {
				throw new Error(`Unknown file type: "${srcFileName}"`);
			}

			const testProjectRootPath = getTestProjectRootPath(
				testWorkspaceFixtureName,
			);
			const sourceFilePath = join(
				testProjectRootPath,
				srcFileFolderPathRelToTestProjectRoot,
				srcFileName,
			);
			const { fileId } = await openSourceFileAndInputView(
				sourceFilePath,
				functionName,
				inputViewType,
			);

			const activeEditor = ensureActiveEditor(fileId);

			const generatedContent = activeEditor.document.getText();

			let ensureRunInputViewCodeLensesFunction: (
				activeEditor: TextEditor,
			) => Promise<void>;
			let expectedContentFileName: string;
			if (languageId === 'typescript') {
				if (inputViewType === 'run') {
					expectedContentFileName = 'expectedRunInputView.ts';
					ensureRunInputViewCodeLensesFunction =
						ensureTypescriptRunInputViewCodeLenses;
				} else {
					expectedContentFileName = 'expectedTestInputView.ts';
					ensureRunInputViewCodeLensesFunction =
						ensureTypescriptTestInputViewCodeLenses;
				}
			} else if (inputViewType === 'run') {
				expectedContentFileName = 'expectedRunInputView.js';
				ensureRunInputViewCodeLensesFunction =
					ensureJavascriptRunInputViewCodeLenses;
			} else {
				throw new Error(
					'Javascript test input view creation is not implemented yet',
				);
			}

			const expectedContent = await getExpectedContent(
				fileId,
				testWorkspaceFixtureName,
				join(
					`${parse(srcFileName).name}.${functionName}`,
					expectedContentFileName,
				),
			);

			assert.strictEqual(generatedContent, expectedContent);

			await ensureRunInputViewCodeLensesFunction(activeEditor);

			await closeAllOpenTextDocuments();
		};
	},
};
