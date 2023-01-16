import { parse } from 'path';
import { transpileToJs } from '@testent/code-preprocessor';
import { createCodeToInvokeFuncAndConsoleLogIO } from '@testent/invoking-code-creator';
import { RunCaseData, TestableFunction } from '@testent/shared-code-processing';
import { CompilerOptions } from 'typescript';
import { ExtensionMode } from 'vscode';
import { Container } from '../../../../container';
import { makeFileToTempFolder } from '../../../../utils/fsUtils';
import { detectOs, LinuxOS, MacOS } from '../../../../utils/systemDetector';
import { escapeInCodeNewlines } from './escapeInCodeNewlines';

export function createJsCodeToInvokeFunc(
	testableFunction: TestableFunction,
	runCaseData: RunCaseData[],
	compilerOptions: CompilerOptions,
): string {
	const importPathOverride = `./${parse(testableFunction.sourceFilePath).base}`;
	const tsCode = createCodeToInvokeFuncAndConsoleLogIO(
		testableFunction,
		runCaseData,
		importPathOverride,
	);
	// compilerOptions.module = ModuleKind.CommonJS;
	let jsCode = transpileToJs(tsCode, compilerOptions);
	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			makeFileToTempFolder('tsCodeToRunWithoutRecorder.ts', tsCode);
			makeFileToTempFolder('jsCodeToRunWithoutRecorder.js', jsCode);
		}
	}

	const osType = detectOs();
	if (osType === LinuxOS || osType === MacOS) {
		jsCode = escapeInCodeNewlines(jsCode);
	}

	return jsCode;
}
