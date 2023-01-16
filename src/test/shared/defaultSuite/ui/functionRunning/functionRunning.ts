import * as assert from 'assert';
import { join, parse } from 'path';
import { normalizePath } from '@testent/shared';
import {
	Commands,
	executeCommand,
	RunRunCasesArgs,
	RunRunCasesReturn,
} from '../../../../../commands';
import { FileId } from '../../../../../languageHandlers/common/fileId';
import {
	getTestProjectRootPath,
	readFileFromTestExpectsAndFixtures,
} from '../../../../utils/fileUtils';
import {
	closeAllOpenTextDocuments,
	openDocument,
	openInputView,
	findTestableFunction,
} from '../../../../utils/viewUtils';
import { replaceValuesToOverride } from '../inputViewCreation/getExpectedContent';

async function runFunctionAndAssert({
	testProjectFixtureName,
	sourceFilePathFromProjectRoot,
	functionName,
	indexOfInputToUse,
	runInputViewOverridePath,
	expectedFunctionRunOutputPath,
}: {
	testProjectFixtureName: string;
	sourceFilePathFromProjectRoot: string;
	functionName: string;
	indexOfInputToUse: number | 'all';
	runInputViewOverridePath: string;
	expectedFunctionRunOutputPath: string;
}) {
	const expectedFunctionRunOutput = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		expectedFunctionRunOutputPath,
	);
	const testProjectRootPath = getTestProjectRootPath(testProjectFixtureName);
	const sourceFilePath = join(
		testProjectRootPath,
		sourceFilePathFromProjectRoot,
	);
	const sourceFileDocument = await openDocument({ sourceFilePath });
	const functionToTest = findTestableFunction(sourceFileDocument, functionName);

	const runInputViewOverride = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		runInputViewOverridePath,
	);

	const fileId: FileId = {
		filePath: normalizePath(sourceFileDocument.uri.fsPath),
		functionName: functionName,
	};

	// The fileId is dynamic and depends on the folder structure on your PC
	// so we need to replace it with the real value
	const updatedRunInputViewOverride = replaceValuesToOverride(
		runInputViewOverride,
		fileId,
	);

	await openInputView(functionToTest, 'run', updatedRunInputViewOverride);

	const args: RunRunCasesArgs = {
		functionName: functionName,
		fileId: fileId,
		useCaseIndex:
			typeof indexOfInputToUse === 'string' ? undefined : indexOfInputToUse,
		returnOutputForTest: true,
	};

	const functionRunOutput = await executeCommand<
		RunRunCasesArgs,
		RunRunCasesReturn
	>(Commands.RunAllRunCases, args);

	if (functionRunOutput === undefined) {
		throw new Error(`No function output for "${functionName}"`);
	}

	assert.strictEqual(
		functionRunOutput,
		expectedFunctionRunOutput,
		`Content of the function "${functionName}" run output did't match expected content`,
	);

	await closeAllOpenTextDocuments();
}

export const functionRunning = {
	name(testWorkspaceFixtureName: string, functionName: string): string {
		return `Testing function running for ${testWorkspaceFixtureName} - ${functionName}`;
	},
	callback(
		testWorkspaceFixtureName: string,
		srcFileFolderPathRelToTestProjectRoot: string,
		srcFileName: string,
		functionName: string,
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

			// Path relative to testExpectsAndFixtures-folder
			const sourceFilePathFromProjectRoot = join(
				srcFileFolderPathRelToTestProjectRoot,
				srcFileName,
			);
			// Path relative to testExpectsAndFixtures-folder
			const runInputViewOverridePath = join(
				`${parse(srcFileName).name}.${functionName}`,
				`runInputViewToRunWith${languageId === 'typescript' ? '.ts' : '.js'}`,
			);
			// Path relative to testExpectsAndFixtures-folder
			const expectedFunctionRunOutputPath = join(
				`${parse(srcFileName).name}.${functionName}`,
				'expectedFunctionRunOutput.txt',
			);

			await runFunctionAndAssert({
				testProjectFixtureName: testWorkspaceFixtureName,
				sourceFilePathFromProjectRoot,
				functionName,
				indexOfInputToUse: 'all',
				runInputViewOverridePath,
				expectedFunctionRunOutputPath,
			});
		};
	},
};
