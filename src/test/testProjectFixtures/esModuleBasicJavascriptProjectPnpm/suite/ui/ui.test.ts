import { type as platformType } from 'os';
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
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'apiFunctions.js',
			functionName: 'getUserDetailsById',
		},
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'apiFunctions.js',
			functionName: 'getUserDetailsByIdTryCatch',
		},
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
	const testFunctionDebugging: TestFunctionDebugging[] = [
		{
			srcFileFolderPathRelToTestProjectRoot: 'src',
			srcFileName: 'createMessage.js',
			functionName: 'createMessage',
			debugInputIndex: 1,
		},
		{
			srcFileFolderPathRelToTestProjectRoot: 'src/utils',
			srcFileName: 'newLineModification.js',
			functionName: 'cutFromNewLine',
			debugInputIndex: 0,
		},
	];
	// TODO: In Windows this test does not work yet
	if (platformType() !== 'Windows_NT') {
		testFunctionDebugging.push({
			srcFileFolderPathRelToTestProjectRoot: 'src/utils',
			srcFileName: 'newLineModification.js',
			functionName: 'escapeInCodeNewlines',
			debugInputIndex: 0,
		});
	}

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
