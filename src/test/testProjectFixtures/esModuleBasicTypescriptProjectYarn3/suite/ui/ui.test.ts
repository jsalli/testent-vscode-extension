import { join } from 'path';
import {
	defaultUITestSetTypescript,
	TestTypescriptSourceCodeLens,
	TestTypescriptInputViewCodeLens,
	TestUnitTestGeneration,
	TestFunctionRunning,
	TestFunctionDebugging,
} from '../../../../shared/defaultSuite/ui/defaultUITestsTypescript';

async function runTests() {
	const testWorkspaceFixtureName = process.env.TESTWORKSPACEFIXTURENAME;
	if (!testWorkspaceFixtureName) {
		throw new Error(
			'Environment variable "testWorkspaceFixtureName" was not set',
		);
	}

	const testTypescriptSourceCodeLens: TestTypescriptSourceCodeLens = {
		srcCodeLensTestFolderPath: join('src', 'sourceCodeLensTests'),
	};
	const testTypescriptInputViewCodeLens: TestTypescriptInputViewCodeLens[] = [
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'apiFunctions.ts',
			functionName: 'getUserDetailsById',
		},
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'apiFunctions.ts',
			functionName: 'getUserDetailsByIdTryCatch',
		},
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'createMessage.ts',
			functionName: 'createMessage',
		},
	];
	const testUnitTestGeneration: TestUnitTestGeneration[] =
		testTypescriptInputViewCodeLens;
	const testFunctionRunning: TestFunctionRunning[] =
		testTypescriptInputViewCodeLens;
	const testFunctionDebugging: TestFunctionDebugging[] =
		testTypescriptInputViewCodeLens.map((testCase) => {
			return { ...testCase, debugInputIndex: 0 };
		});

	await defaultUITestSetTypescript(
		testWorkspaceFixtureName,
		testTypescriptSourceCodeLens,
		testTypescriptInputViewCodeLens,
		testUnitTestGeneration,
		testFunctionRunning,
		testFunctionDebugging,
		true,
	);
}

void runTests();
