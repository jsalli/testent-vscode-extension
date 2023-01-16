import * as assert from 'assert';
import { join, parse } from 'path';
import { normalizePath } from '@testent/shared';
import {
	Commands,
	executeCommand,
	DebugRunCasesArgs,
	DebugRunCasesReturn,
} from '../../../../../commands';
import { FileId } from '../../../../../languageHandlers/common/fileId';
import {
	deleteFile,
	getTestProjectRootPath,
	readFileFromTestExpectsAndFixtures,
} from '../../../../utils/fileUtils';
import {
	closeAllOpenTextDocuments,
	openDocument,
	createAndOpenDocumentFromContent,
} from '../../../../utils/viewUtils';
import { replaceValuesToOverride } from '../inputViewCreation/getExpectedContent';
import { sleepMilliSeconds } from '../../../../utils/utils';

async function debugFunctionAndAssert({
	testProjectFixtureName,
	sourceFilePathFromProjectRoot,
	functionName,
	debugInputViewContentFilePath,
	debugInputFileName,
	debugInputIndex,
}: {
	testProjectFixtureName: string;
	sourceFilePathFromProjectRoot: string;
	functionName: string;
	debugInputViewContentFilePath: string;
	debugInputFileName: string;
	debugInputIndex: number;
}) {
	const testProjectRootPath = getTestProjectRootPath(testProjectFixtureName);
	const sourceFilePath = join(
		testProjectRootPath,
		sourceFilePathFromProjectRoot,
	);
	const sourceFileDocument = await openDocument({ sourceFilePath });

	const debugInputViewContent = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		debugInputViewContentFilePath,
	);

	const fileId: FileId = {
		filePath: normalizePath(sourceFileDocument.uri.fsPath),
		functionName: functionName,
	};

	// The fileId is dynamic and depends on the folder structure on your PC
	// so we need to replace it with the real value
	const updatedDebugInputViewOverride = replaceValuesToOverride(
		debugInputViewContent,
		fileId,
	);

	const sourceFileFolder = parse(sourceFilePath).dir;
	const debugInputViewTextDocument = await createAndOpenDocumentFromContent(
		join(sourceFileFolder, debugInputFileName),
		updatedDebugInputViewOverride,
	);

	const args: DebugRunCasesArgs = {
		functionName: functionName,
		fileId: fileId,
		useCaseIndex: debugInputIndex,
		returnSuccessForTest: true,
	};

	let functionDebugSuccess: boolean = false;
	try {
		await executeCommand<DebugRunCasesArgs, DebugRunCasesReturn>(
			Commands.DebugOneRunCase,
			args,
		);
		functionDebugSuccess = true;
	} catch (error) {
		console.error(`Debugging failed with error:\n${error?.message}`);
		functionDebugSuccess = false;
	}
	assert.strictEqual(
		functionDebugSuccess,
		true,
		`Debugging the function "${functionName}" crashed`,
	);

	await closeAllOpenTextDocuments();
	await deleteFile(debugInputViewTextDocument.uri.fsPath);

	// Try to fix the tests stalling issue do to some timing problem
	await sleepMilliSeconds(1000);
}

export const functionDebugging = {
	name(testWorkspaceFixtureName: string, functionName: string): string {
		return `Testing function debugging for ${testWorkspaceFixtureName} - ${functionName}`;
	},
	callback(
		testWorkspaceFixtureName: string,
		srcFileFolderPathRelToTestProjectRoot: string,
		srcFileName: string,
		functionName: string,
		debugInputIndex: number,
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
			const debugInputFileName = `debugInputViewToDebugWith${
				languageId === 'typescript' ? '.ts' : '.js'
			}`;
			const debugInputViewContentFilePath = join(
				`${parse(srcFileName).name}.${functionName}`,
				debugInputFileName,
			);

			await debugFunctionAndAssert({
				testProjectFixtureName: testWorkspaceFixtureName,
				sourceFilePathFromProjectRoot,
				functionName,
				debugInputViewContentFilePath,
				debugInputFileName,
				debugInputIndex,
			});
		};
	},
};
