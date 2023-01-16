import { parse } from 'path';
import { RunCaseData, TestableFunction } from '@testent/shared-code-processing';
import {
	debug,
	DebugConfiguration,
	DebugSessionOptions,
	Uri,
	workspace,
	WorkspaceFolder,
} from 'vscode';
import { createJsTsFuncExecutionInExtProcess } from '../codeRunning/createJsTsFuncExecutionInExtProcess';
import { JsTsLanguageHandler } from '../JsTsLanguageHandler';

export async function debugJsTsCodeWithRunCases(
	testableFunction: TestableFunction,
	runCaseData: RunCaseData[],
	returnSuccessForTest?: boolean | undefined,
): Promise<void> {
	const workspaceFolder = workspace.getWorkspaceFolder(
		Uri.file(testableFunction.sourceFilePath),
	);
	if (workspaceFolder == null) {
		throw new Error(
			`Could not find wordspace base folder for path ${testableFunction.sourceFilePath}`,
		);
	}
	const sourceFileDirAbsPath = parse(testableFunction.sourceFilePath).dir;

	await createJsTsFuncExecutionInExtProcess({
		testableFunction,
		runCaseData,
		debugProcess: true,
	});

	await new Promise((res, rej): void => {
		function debuggerSuccessCallBack(debugFinishedSuccessful: boolean): void {
			JsTsLanguageHandler.jsTsDebugConfigurationProvider.disposeDebugAdapterTracker();
			if (!returnSuccessForTest) {
				return;
			}

			if (debugFinishedSuccessful === true) {
				res();
				return;
			}
			rej();
		}

		if (
			testableFunction.languageId !== 'javascript' &&
			testableFunction.languageId !== 'typescript'
		) {
			throw new Error(
				`For debugging with NodeJS debugger the expected languages are "javascript" "typescript". Got "${testableFunction.languageId}"`,
			);
		}

		const debugConfiguration = getDebugConfig(
			workspaceFolder,
			sourceFileDirAbsPath,
			debuggerSuccessCallBack,
		);

		const debugSessionOptions: DebugSessionOptions = {
			suppressSaveBeforeStart: true,
		};

		void debug.startDebugging(
			workspaceFolder,
			debugConfiguration,
			debugSessionOptions,
		);
		if (returnSuccessForTest) {
			return;
		}
		res();
	});
}

function getDebugConfig(
	workspaceFolder: WorkspaceFolder,
	cwd: string,
	debuggerSuccessCallBack: (debugCrashed: boolean) => void,
): DebugConfiguration {
	let debugConfig = workspace
		.getConfiguration('launch', workspaceFolder)
		?.get<DebugConfiguration[]>('configurations')
		?.filter((config) => config.name === 'testent-debug-functions')[0];
	JsTsLanguageHandler.jsTsDebugConfigurationProvider.prepareFunctionRun(
		cwd,
		debuggerSuccessCallBack,
	);

	if (debugConfig == null) {
		// void window.showWarningMessage(
		// 	'Could not find debug config named "testent-debug-functions" in launch.json Using a default config.\nCreate a custom launch-config named "testent-debug-functions" if you run into problems',
		// );
		debugConfig =
			JsTsLanguageHandler.jsTsDebugConfigurationProvider.provideDebugConfigurations(
				workspaceFolder,
			)[0];
	}

	return debugConfig;
}
