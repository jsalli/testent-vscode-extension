import { join } from 'path';
import {
	defaultUITestSetJavascript,
	TestJavascriptSourceCodeLens,
	TestJavascriptInputViewCodeLens,
	TestUnitTestGeneration,
	TestFunctionRunning,
	TestFunctionDebugging,
} from '../../../../shared/defaultSuite/ui/defaultUITestsJavascript';

async function runTests() {
	const testWorkspaceFixtureName = process.env.TESTWORKSPACEFIXTURENAME;
	if (!testWorkspaceFixtureName) {
		throw new Error(
			'Environment variable "testWorkspaceFixtureName" was not set',
		);
	}

	const testJavascriptSourceCodeLens: TestJavascriptSourceCodeLens = {
		srcCodeLensTestFolderPath: join('src', 'sourceCodeLensTests'),
	};
	const testJavascriptInputViewCodeLens: TestJavascriptInputViewCodeLens[] = [
		// {
		// 	srcFileFolderPathRelToTestProjectRoot: 'src',
		// 	srcFileName: 'apiFunctions.js',
		// 	functionName: 'getUserDetailsById',
		// },
		// {
		// 	srcFileFolderPathRelToTestProjectRoot: 'src',
		// 	srcFileName: 'apiFunctions.js',
		// 	functionName: 'getUserDetailsByIdTryCatch',
		// },
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'createMessage.js',
			functionName: 'createMessage',
		},
	];
	const testUnitTestGeneration: TestUnitTestGeneration[] =
		testJavascriptInputViewCodeLens;
	const testFunctionRunning: TestFunctionRunning[] =
		testJavascriptInputViewCodeLens;
	const testFunctionDebugging: TestFunctionDebugging[] =
		testJavascriptInputViewCodeLens.map((testCase) => {
			return { ...testCase, debugInputIndex: 0 };
		});

	await defaultUITestSetJavascript(
		testWorkspaceFixtureName,
		testJavascriptSourceCodeLens,
		testJavascriptInputViewCodeLens,
		testUnitTestGeneration,
		testFunctionRunning,
		testFunctionDebugging,
	);
}

void runTests();
