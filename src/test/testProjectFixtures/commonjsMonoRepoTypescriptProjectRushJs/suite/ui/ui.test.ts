import { type as platformType } from 'os';
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

	const testTypescriptSourceCodeLens1: TestTypescriptSourceCodeLens = {
		srcCodeLensTestFolderPath: join(
			'packages',
			'package1',
			'src',
			'sourceCodeLensTests',
		),
	};
	const testTypescriptInputViewCodeLens1: TestTypescriptInputViewCodeLens[] = [
		{
			srcFileFolderPathRelToTestProjectRoot: join(
				'packages',
				'package1',
				'src',
			),
			srcFileName: 'apiFunctions.ts',
			functionName: 'getUserDetailsById',
		},
		{
			srcFileFolderPathRelToTestProjectRoot: join(
				'packages',
				'package1',
				'src',
			),
			srcFileName: 'apiFunctions.ts',
			functionName: 'getUserDetailsByIdTryCatch',
		},
	];
	const testUnitTestGeneration1: TestUnitTestGeneration[] =
		testTypescriptInputViewCodeLens1;
	const testFunctionRunning1: TestFunctionRunning[] =
		testTypescriptInputViewCodeLens1;
	const testFunctionDebugging1: TestFunctionDebugging[] = [];

	await defaultUITestSetTypescript(
		testWorkspaceFixtureName,
		testTypescriptSourceCodeLens1,
		testTypescriptInputViewCodeLens1,
		testUnitTestGeneration1,
		testFunctionRunning1,
		testFunctionDebugging1,
		true,
	);

	const testTypescriptSourceCodeLens2: TestTypescriptSourceCodeLens = {
		srcCodeLensTestFolderPath: join(
			'packages',
			'package2',
			'src',
			'sourceCodeLensTests',
		),
	};
	const testTypescriptInputViewCodeLens2: TestTypescriptInputViewCodeLens[] = [
		{
			srcFileFolderPathRelToTestProjectRoot: join(
				'packages',
				'package2',
				'src',
			),
			srcFileName: 'createMessage.ts',
			functionName: 'createMessage',
		},
	];
	const testUnitTestGeneration2: TestUnitTestGeneration[] =
		testTypescriptInputViewCodeLens2;
	const testFunctionRunning2: TestFunctionRunning[] =
		testTypescriptInputViewCodeLens2;
	const testFunctionDebugging2: TestFunctionDebugging[] = [
		{
			srcFileFolderPathRelToTestProjectRoot: join(
				'packages',
				'package2',
				'src',
			),
			srcFileName: 'createMessage.ts',
			functionName: 'createMessage',
			debugInputIndex: 1,
		},
	];
	// TODO: In Windows this test does not work yet
	if (platformType() !== 'Windows_NT') {
		testFunctionDebugging2.push(
			{
				srcFileFolderPathRelToTestProjectRoot: join(
					'packages',
					'package2',
					'src',
					'utils',
				),
				srcFileName: 'newLineModification.ts',
				functionName: 'cutFromNewLine',
				debugInputIndex: 0,
			},
			{
				srcFileFolderPathRelToTestProjectRoot: join(
					'packages',
					'package2',
					'src',
					'utils',
				),
				srcFileName: 'newLineModification.ts',
				functionName: 'escapeInCodeNewlines',
				debugInputIndex: 0,
			},
		);
	}

	await defaultUITestSetTypescript(
		testWorkspaceFixtureName,
		testTypescriptSourceCodeLens2,
		testTypescriptInputViewCodeLens2,
		testUnitTestGeneration2,
		testFunctionRunning2,
		testFunctionDebugging2,
		true,
	);
}

void runTests();
