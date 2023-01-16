import { closeAllOpenTextDocuments } from '../../../utils/viewUtils';
import { functionRunning } from './functionRunning/functionRunning';
import { functionDebugging } from './functionDebugging/functionDebugging';
import { inputViewCreation } from './inputViewCreation/inputViewCreation';
// import {
// 	jsTsParseTestableFunctions1,
// 	jsTsParseTestableFunctions2,
// 	jsTsParseTestableFunctions3,
// } from './languageHandlers.javascriptTypescript/parseTestableFunctions';
import {
	sourceCodeLensJavascriptSet1,
	sourceCodeLensJavascriptSet2,
} from './sourceCodeLensProviders/javascriptCodeLenses';
// import { unitTestGeneration } from './unitTestGeneration/unitTestGeneration';
import {
	TestTypescriptSourceCodeLens,
	TestTypescriptInputViewCodeLens,
	TestUnitTestGeneration,
	TestFunctionRunning,
	TestFunctionDebugging,
} from './defaultUITestsTypescript';

export interface TestJavascriptSourceCodeLens
	extends TestTypescriptSourceCodeLens {}
export interface TestJavascriptInputViewCodeLens
	extends TestTypescriptInputViewCodeLens {}
export type {
	TestUnitTestGeneration,
	TestFunctionRunning,
	TestFunctionDebugging,
};

export function defaultUITestSetJavascript(
	testWorkspaceFixtureName: string,
	testJavascriptSourceCodeLens: TestJavascriptSourceCodeLens | undefined,
	testJavascriptInputViewCodeLens:
		| TestJavascriptInputViewCodeLens[]
		| undefined,
	testUnitTestGeneration: TestUnitTestGeneration[] | undefined,
	testFunctionRunning: TestFunctionRunning[],
	testFunctionDebugging: TestFunctionDebugging[],
	// testFunctionParsing: boolean,
): Promise<void> {
	return new Promise((res) => {
		suite('Extension Test Suite. UI stuff', () => {
			suiteSetup(async () => {
				await closeAllOpenTextDocuments();
			});

			suiteTeardown(async () => {
				await closeAllOpenTextDocuments();
				res();
			});

			if (testJavascriptSourceCodeLens) {
				// Testing source code codelens generation
				test(
					sourceCodeLensJavascriptSet1.name(testWorkspaceFixtureName),
					sourceCodeLensJavascriptSet1.callback(
						testWorkspaceFixtureName,
						testJavascriptSourceCodeLens.srcCodeLensTestFolderPath,
					),
				);
				test(
					sourceCodeLensJavascriptSet2.name(testWorkspaceFixtureName),
					sourceCodeLensJavascriptSet2.callback(
						testWorkspaceFixtureName,
						testJavascriptSourceCodeLens.srcCodeLensTestFolderPath,
					),
				);
			}

			if (testJavascriptInputViewCodeLens) {
				//Testing run input view creation
				for (const testCase of testJavascriptInputViewCodeLens) {
					test(
						inputViewCreation.name(
							'run',
							testWorkspaceFixtureName,
							testCase.functionName,
						),
						inputViewCreation.callback(
							testWorkspaceFixtureName,
							testCase.srcFileFolderPathRelToTestProjectRoot,
							testCase.srcFileName,
							testCase.functionName,
							'run',
						),
					);
				}
			}

			// if (testFunctionParsing) {
			// Testing JS and TS testable function parsing
			// test(
			// 	jsTsParseTestableFunctions1.name,
			// 	jsTsParseTestableFunctions1.callback,
			// );
			// test(
			// 	jsTsParseTestableFunctions2.name,
			// 	jsTsParseTestableFunctions2.callback,
			// );
			// test(
			// 	jsTsParseTestableFunctions3.name,
			// 	jsTsParseTestableFunctions3.callback,
			// );
			// }

			// // Testing unit test generation
			// for (const testCase of testUnitTestGeneration) {
			// 	test(
			// 		unitTestGeneration.name(testWorkspaceFixtureName),
			// 		unitTestGeneration.callback(
			// 			testWorkspaceFixtureName,
			// 			testCase.srcFileFolderPathRelToTestProjectRoot,
			// 			testCase.srcFileName,
			// 			testCase.functionName,
			// 		),
			// 	);
			// }

			// Testing function running
			for (const testCase of testFunctionRunning) {
				test(
					functionRunning.name(testWorkspaceFixtureName, testCase.functionName),
					functionRunning.callback(
						testWorkspaceFixtureName,
						testCase.srcFileFolderPathRelToTestProjectRoot,
						testCase.srcFileName,
						testCase.functionName,
					),
				);
			}

			// Testing function debugging
			for (const testCase of testFunctionDebugging) {
				test(
					functionDebugging.name(
						testWorkspaceFixtureName,
						testCase.functionName,
					),
					functionDebugging.callback(
						testWorkspaceFixtureName,
						testCase.srcFileFolderPathRelToTestProjectRoot,
						testCase.srcFileName,
						testCase.functionName,
						testCase.debugInputIndex,
					),
				);
			}
		});
	});
}
