import { normalizePath } from '@testent/shared';
import {
	NotSupportedFunction,
	RunCaseData,
	TestableFunction,
	TestSuiteData,
} from '@testent/shared-code-processing';
import { RecordingStorageDataJSON } from '@testent/shared-recording';
import { createSourceFile, forEachChild, ScriptTarget } from 'typescript';
import { TextDocument, Uri, workspace } from 'vscode';
import { JsTsDebugConfigurationProvider } from '../../debugConfigurationProviders/JsTsDebugConfigurationProvider';
import { FileId } from '../../languageHandlers/common/fileId';
import { Logger } from '../../logger';
import { TestCase } from '../../types/types';
import { InputViewMatches } from '../common/common';
import { findFooterSection } from '../common/finders/findFooterSection';
import { findHeaderSection } from '../common/finders/findHeaderSection';
import { findUseCasesForCodeLens } from '../common/finders/findUseCasesForCodeLens';
import { debugJsTsCodeWithRunCases } from './codeDebugging/debugJsTsCodeWithRunCases';
import { runJsTsFuncInExtProcessPipeStdToOutputChannel } from './codeRunning/runJsTsFuncInExtProcessPipeStdToOutputChannel';
import { runJsTsFunctionWithRecorder } from './codeRunning/runJsTsFunctionWithRecorder';
import {
	createNewRunCaseInputString,
	createRunInputViewContentString,
} from './creatingInputViews/runInputViewContent';
import {
	createNewTestCaseInputString,
	createTestInputViewContentString,
} from './creatingInputViews/testInputViewContent';
import { findExportedFunctions } from './findExportedFunctions/findExportedFunctions';
import { parseJsTsRunInputView } from './parsingInputViews/parseJsTsRunInputView';
import { parseJsTsTestInputView } from './parsingInputViews/parseJsTsTestInputView';
import { TestableFunctionCache } from './TestableFunctionCache';

export class JsTsLanguageHandler {
	public static jsTsDebugConfigurationProvider =
		new JsTsDebugConfigurationProvider();

	private static testableFunctionCache = new TestableFunctionCache();

	public static languageIdIsTypeScript(languageId: string): boolean {
		return languageId === 'typescript';
	}

	public static languageIdIsJavaScript(languageId: string): boolean {
		return languageId === 'javascript';
	}

	public static async getTestableFunctionByFileId(
		fileId: FileId,
	): Promise<TestableFunction> {
		const maybeTestableFunction =
			this.testableFunctionCache.getTestableFunction(fileId);
		if (maybeTestableFunction !== undefined) {
			return maybeTestableFunction;
		}
		const sourceFileUri = Uri.file(fileId.filePath);
		const document = await workspace.openTextDocument(sourceFileUri);
		const foundFunctions = this.parseTestableFunctions(document);

		this.testableFunctionCache.addFunctionToCache(
			normalizePath(document.uri.fsPath),
			foundFunctions,
		);

		const maybeNowTestableFunction =
			this.testableFunctionCache.getTestableFunction(fileId);
		if (maybeNowTestableFunction === undefined) {
			throw new Error(
				`Could not find function "${fileId.functionName}" from file "${fileId.filePath}"`,
			);
		}
		return maybeNowTestableFunction;
	}

	/**
	 * Find testable functions from given source file.
	 *
	 * @param document
	 * @returns (TestableFunction | NotSupported)[]
	 */
	public static parseTestableFunctions(
		document: TextDocument,
	): (TestableFunction | NotSupportedFunction)[] {
		const foundFunctions: (TestableFunction | NotSupportedFunction)[] = [];

		const sourceCode = document.getText();
		const tsSourceFile = createSourceFile(
			normalizePath(document.uri.fsPath),
			sourceCode,
			ScriptTarget.Latest,
			true,
		);

		forEachChild(
			tsSourceFile,
			findExportedFunctions(document, tsSourceFile, foundFunctions),
		);

		this.testableFunctionCache.addFunctionToCache(
			normalizePath(document.uri.fsPath),
			foundFunctions,
		);
		return foundFunctions;
	}

	public static createInputViewContent(
		testableFunction: TestableFunction,
		// fileId: string,
		inputViewType: 'run' | 'test',
		existingTestCases?: TestCase[] | undefined,
	): string {
		let content: string;
		if (inputViewType === 'run') {
			content = createRunInputViewContentString(testableFunction);
		} else {
			content = createTestInputViewContentString(
				testableFunction,
				existingTestCases,
			);
		}

		return content;
	}

	public static async createNewInputCase(
		fileId: FileId,
		inputViewType: 'run' | 'test',
	): Promise<string> {
		let content: string;

		const testableFunction = await this.getTestableFunctionByFileId(fileId);
		if (inputViewType === 'run') {
			content = createNewRunCaseInputString(testableFunction);
		} else {
			content = createNewTestCaseInputString(testableFunction);
		}

		return `\n${content}`;
	}

	public static parseInputViewForCodeLens(
		document: TextDocument,
	): InputViewMatches | undefined {
		try {
			const { ioViewHeader, functionName } = findHeaderSection(document);
			if (ioViewHeader === undefined || functionName === undefined) {
				return undefined;
			}

			const testCases = findUseCasesForCodeLens(document);

			const ioViewFooter = findFooterSection(document);

			return {
				header: ioViewHeader,
				footer: ioViewFooter,
				testCases: testCases,
				functionName,
			};
		} catch (error) {
			const message = 'Error parsing InputOutputView Content!';
			Logger.error(error, message);
			throw error;
		}
	}

	public static async runFunctionWithRecorderForTestCases(
		testableFunction: TestableFunction,
		testSuiteData: TestSuiteData,
	): Promise<RecordingStorageDataJSON[]> {
		return runJsTsFunctionWithRecorder(testableFunction, testSuiteData);
	}

	public static runFunctionWithRunCases(
		testableFunction: TestableFunction,
		runCaseData: RunCaseData[],
		returnOutputForTest?: true | undefined,
	): Promise<string | undefined> {
		return runJsTsFuncInExtProcessPipeStdToOutputChannel({
			testableFunction,
			runCaseData,
			returnOutputForTest,
		});
	}

	public static debugFunctionWithRunCases(
		testableFunction: TestableFunction,
		runCaseData: RunCaseData[],
		returnSuccessForTest?: boolean | undefined,
	): Promise<void> {
		return debugJsTsCodeWithRunCases(
			testableFunction,
			runCaseData,
			returnSuccessForTest,
		);
	}

	/**
	 * Parse Test suite data from TestInputView
	 *
	 * @param document
	 * @param testableFunction
	 * @param testCaseIndex Index of the test case inputs from inputOutputView. Optional.
	 * @returns
	 */
	public static parseTestInputView(
		document: TextDocument,
		testableFunction: TestableFunction,
		testCaseIndex?: number,
	): TestSuiteData {
		return parseJsTsTestInputView(document, testableFunction, testCaseIndex);
	}

	public static parseRunInputView(
		document: TextDocument,
		testableFunction: TestableFunction,
		testCaseIndex?: number,
	): RunCaseData[] {
		return parseJsTsRunInputView(document, testableFunction, testCaseIndex);
	}
}
