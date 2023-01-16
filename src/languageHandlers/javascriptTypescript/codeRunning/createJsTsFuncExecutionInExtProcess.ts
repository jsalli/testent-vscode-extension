import { ChildProcess } from 'child_process';
import { parse } from 'path';
import { RunCaseData, TestableFunction } from '@testent/shared-code-processing';
import { createJsCodeToInvokeFunc } from './shared/createJsCodeToInvokeFunc';
import { createProcess } from './shared/createProcess';
import { detectJsTsModuleOptions } from './shared/detectJsTsModuleOptions';
import { jsTsProcessRunOptionsCreator } from './shared/jsTsProcessRunOptionsCreator';

export async function createJsTsFuncExecutionInExtProcess({
	testableFunction,
	runCaseData,
	debugProcess,
}: {
	testableFunction: TestableFunction;
	runCaseData: RunCaseData[];
	debugProcess?: true | undefined;
}): Promise<ChildProcess> {
	const { languageId, moduleType, compilerOptions, tsConfigJsonFileAbsPath } =
		await detectJsTsModuleOptions(testableFunction);

	const jsCodeToInvokeFunc = createJsCodeToInvokeFunc(
		testableFunction,
		runCaseData,
		compilerOptions,
	);

	const sourceFileDirAbsPath = parse(testableFunction.sourceFilePath).dir;
	const processRunOptions = jsTsProcessRunOptionsCreator({
		languageId,
		sourceFileFolderPath: sourceFileDirAbsPath,
		code: jsCodeToInvokeFunc,
		moduleType,
		tsConfigJsonFileAbsPath,
		debugProcess,
	});

	const process = createProcess(processRunOptions);

	return process;
}
