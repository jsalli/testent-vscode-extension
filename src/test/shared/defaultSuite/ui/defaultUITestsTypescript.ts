import { closeAllOpenTextDocuments } from '../../../utils/viewUtils';
import { functionRunning } from './functionRunning/functionRunning';
import { functionDebugging } from './functionDebugging/functionDebugging';
import { inputViewCreation } from './inputViewCreation/inputViewCreation';
import {
	jsTsParseTestableFunctions1,
	jsTsParseTestableFunctions2,
	jsTsParseTestableFunctions3,
} from './languageHandlers.javascriptTypescript/parseTestableFunctions';
import {
	sourceCodeLensTypescriptSet1,
	sourceCodeLensTypescriptSet2,
} from './sourceCodeLensProviders/typescriptCodeLenses';
import { unitTestGeneration } from './unitTestGeneration/unitTestGeneration';

export interface TestTypescriptSourceCodeLens {
	srcCodeLensTestFolderPath: string;
}

export interface TestTypescriptInputViewCodeLens {
	srcFileFolderPathRelToTestProjectRoot: string;
	srcFileName: string;
	functionName: string;
}

export interface TestUnitTestGeneration
	extends TestTypescriptInputViewCodeLens {}

export interface TestFunctionRunning extends TestTypescriptInputViewCodeLens {}

export interface TestFunctionDebugging extends TestTypescriptInputViewCodeLens {
	debugInputIndex: number;
}

export function defaultUITestSetTypescript(
	testWorkspaceFixtureName: string,
	testTypescriptSourceCodeLens: TestTypescriptSourceCodeLens | undefined,
	testTypescriptInputViewCodeLens:
		| TestTypescriptInputViewCodeLens[]
		| undefined,
	testUnitTestGeneration: TestUnitTestGeneration[],
	testFunctionRunning: TestFunctionRunning[],
	testFunctionDebugging: TestFunctionDebugging[],
	testFunctionParsing: boolean,
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

			if (testTypescriptSourceCodeLens) {
				// Testing source code codelens generation
				test(
					sourceCodeLensTypescriptSet1.name(testWorkspaceFixtureName),
					sourceCodeLensTypescriptSet1.callback(
						testWorkspaceFixtureName,
						testTypescriptSourceCodeLens.srcCodeLensTestFolderPath,
					),
				);
				test(
					sourceCodeLensTypescriptSet2.name(testWorkspaceFixtureName),
					sourceCodeLensTypescriptSet2.callback(
						testWorkspaceFixtureName,
						testTypescriptSourceCodeLens.srcCodeLensTestFolderPath,
					),
				);
			}

			if (testTypescriptInputViewCodeLens) {
				// Testing test and run input view creation
				for (const testCase of testTypescriptInputViewCodeLens) {
					test(
						inputViewCreation.name(
							'test',
							testWorkspaceFixtureName,
							testCase.functionName,
						),
						inputViewCreation.callback(
							testWorkspaceFixtureName,
							testCase.srcFileFolderPathRelToTestProjectRoot,
							testCase.srcFileName,
							testCase.functionName,
							'test',
						),
					);

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

			if (testFunctionParsing) {
				// Testing JS and TS testable function parsing
				test(
					jsTsParseTestableFunctions1.name,
					jsTsParseTestableFunctions1.callback,
				);
				test(
					jsTsParseTestableFunctions2.name,
					jsTsParseTestableFunctions2.callback,
				);
				test(
					jsTsParseTestableFunctions3.name,
					jsTsParseTestableFunctions3.callback,
				);
			}

			// Testing unit test generation
			for (const testCase of testUnitTestGeneration) {
				test(
					unitTestGeneration.name(
						testWorkspaceFixtureName,
						testCase.functionName,
					),
					unitTestGeneration.callback(
						testWorkspaceFixtureName,
						testCase.srcFileFolderPathRelToTestProjectRoot,
						testCase.srcFileName,
						testCase.functionName,
					),
				);
			}

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
