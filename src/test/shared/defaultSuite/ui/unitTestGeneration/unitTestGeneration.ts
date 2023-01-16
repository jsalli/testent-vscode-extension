import * as assert from 'assert';
import { join, parse } from 'path';
import { normalizePath } from '@testent/shared';
import {
	Commands,
	CreateTestCasesArgs,
	CreateTestCasesReturn,
	executeCommand,
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

async function generateUnitTestAndAssert({
	testProjectFixtureName,
	sourceFilePathFromProjectRoot,
	functionName,
	indexOfInputToUse,
	testInputViewOverridePath,
	expectedTestCodeFilePath,
	expectedTestFileLocation,
}: {
	testProjectFixtureName: string;
	sourceFilePathFromProjectRoot: string;
	functionName: string;
	indexOfInputToUse: number | 'all';
	testInputViewOverridePath: string;
	expectedTestCodeFilePath: {
		folderName: string;
		testFileName: string;
	};
	expectedTestFileLocation: string;
}) {
	const expectedTestCode = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		join(
			expectedTestCodeFilePath.folderName,
			expectedTestCodeFilePath.testFileName,
		),
	);
	const testProjectRootPath = getTestProjectRootPath(testProjectFixtureName);
	const sourceFilePath = join(
		testProjectRootPath,
		sourceFilePathFromProjectRoot,
	);
	const sourceFileDocument = await openDocument({ sourceFilePath });
	const functionToTest = findTestableFunction(sourceFileDocument, functionName);

	const testInputViewOverride = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		testInputViewOverridePath,
	);

	const fileId: FileId = {
		filePath: normalizePath(sourceFileDocument.uri.fsPath),
		functionName: functionName,
	};

	// The fileId is dynamic and depends on the folder structure on your PC
	// so we need to replace it with the real value
	const updatedTestInputViewOverride = replaceValuesToOverride(
		testInputViewOverride,
		fileId,
	);

	await openInputView(functionToTest, 'test', updatedTestInputViewOverride);

	const args: CreateTestCasesArgs = {
		functionName: functionName,
		fileId: fileId,
		testCaseIndex:
			typeof indexOfInputToUse === 'string' ? undefined : indexOfInputToUse,
		returnContentForTest: true,
	};

	const createTestCode = await executeCommand<
		CreateTestCasesArgs,
		CreateTestCasesReturn
	>(Commands.CreateOneTestCase, args);

	if (createTestCode === undefined) {
		throw new Error(`No test code created for "${functionName}"`);
	} else if (typeof createTestCode === 'string') {
		throw new Error(
			`No test code created for "${functionName}". Message:\n${createTestCode}`,
		);
	}

	assert.strictEqual(
		createTestCode.fileContent,
		expectedTestCode,
		`Content of the generated unit test for function "${functionName}" did't match expected content`,
	);
	assert.strictEqual(
		createTestCode.fileName,
		expectedTestCodeFilePath.testFileName,
		`File name of the generated unit test for function "${functionName}" did't match expected file name`,
	);
	assert.strictEqual(
		createTestCode.filePath,
		normalizePath(join(testProjectRootPath, expectedTestFileLocation)),
		`File path name of the generated unit test for function "${functionName}" did't match expected file path`,
	);

	await closeAllOpenTextDocuments();
}

export const unitTestGeneration = {
	name(testWorkspaceFixtureName: string, functionName: string): string {
		return `Testing unit test generation for ${testWorkspaceFixtureName} - ${functionName}`;
	},
	callback(
		testWorkspaceFixtureName: string,
		srcFileFolderPathRelToTestProjectRoot: string,
		srcFileName: string,
		functionName: string,
	): () => Promise<void> {
		return async () => {
			const sourceFilePathFromProjectRoot = join(
				srcFileFolderPathRelToTestProjectRoot,
				srcFileName,
			);
			const testInputViewOverridePath = join(
				`${parse(srcFileName).name}.${functionName}`,
				'testInputViewToGenerateTestWith.ts',
			);
			const expectedTestCodeFilePath = {
				folderName: `${parse(srcFileName).name}.${functionName}`,
				testFileName: `${parse(srcFileName).name}.${functionName}.spec.ts`,
			};

			await generateUnitTestAndAssert({
				testProjectFixtureName: testWorkspaceFixtureName,
				sourceFilePathFromProjectRoot,
				functionName,
				indexOfInputToUse: 'all',
				testInputViewOverridePath,
				expectedTestCodeFilePath,
				expectedTestFileLocation: srcFileFolderPathRelToTestProjectRoot,
			});
		};
	},
};
