import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	DocumentSelector,
	Event,
	EventEmitter,
	Range,
	TextDocument,
} from 'vscode';
import { Container } from '../container';
import { InputViewTestCase } from '../languageHandlers/common/common';
import { FileId } from '../languageHandlers/common/fileId';
import { findFileId } from '../languageHandlers/common/finders/findFileId';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import {
	AddNewUseCaseCodeLens,
	resolveAddNewUseCaseCodeLens,
} from './codeLenses/AddNewUseCaseCodeLens';
import {
	CloseTextEditorCodeLens,
	resolveCloseTextEditorCodeLens,
} from './codeLenses/CloseTextEditorCodeLens';
import {
	CreateAllTestCasesCodeLens,
	resolveCreateAllTestCasesCodeLens,
} from './codeLenses/CreateAllTestCasesCodeLens';
import {
	CreateOneTestCaseCodeLens,
	resolveCreateOneTestCaseCodeLens,
} from './codeLenses/CreateOneTestCaseCodeLens';
import {
	DebugOneRunCaseCodeLens,
	resolveDebugOneRunCaseCodeLens,
} from './codeLenses/DebugOneRunCaseCodeLens';
import {
	resolveRunAllRunCasesCodeLens,
	RunAllRunCasesCodeLens,
} from './codeLenses/RunAllRunCasesCodeLens';
import {
	resolveRunOneRunCaseCodeLens,
	RunOneRunCaseCodeLens,
} from './codeLenses/RunOneRunCaseCodeLens';

export class TestInputViewCodeLensProvider implements CodeLensProvider {
	public static readonly selector: DocumentSelector = [
		{
			// scheme: DocumentSchemes.Untitled,
			language: 'typescript',
		},
		{
			// scheme: DocumentSchemes.Untitled,
			language: 'javascript',
		},
		// {
		// 	scheme: DocumentSchemes.File,
		// 	language: 'python',
		// },
	];

	constructor(private container: Container) {}

	reset() {
		this._onDidChangeCodeLenses.fire();
	}

	private _onDidChangeCodeLenses = new EventEmitter<void>();
	get onDidChangeCodeLenses(): Event<void> {
		return this._onDidChangeCodeLenses.event;
	}

	public provideCodeLenses(
		document: TextDocument,
		token: CancellationToken,
	): CodeLens[] {
		try {
			const lenses: CodeLens[] = [];

			if (!this.isTestInputView(document)) {
				return [];
			}

			const fileId = findFileId(document.getText());
			if (fileId == null) {
				return [];
			}

			const ioViewMatches =
				JsTsLanguageHandler.parseInputViewForCodeLens(document);
			if (ioViewMatches === undefined) {
				return [];
			}

			lenses.push(
				...this.createHeaderCodelenses(
					ioViewMatches.header.range,
					ioViewMatches.functionName,
					fileId,
					document.isUntitled,
				),
			);

			// Add test case codelenses
			for (const testCase of ioViewMatches.testCases.entries()) {
				lenses.push(
					...this.createTestCaseCodelenses(
						testCase[0],
						testCase[1],
						ioViewMatches.functionName,
						fileId,
						document.isUntitled,
					),
				);
			}

			if (token.isCancellationRequested) {
				return [];
			}

			// Add footer codelenses
			lenses.push(
				...this.createFooterCodelenses(
					ioViewMatches.footer.range,
					ioViewMatches.functionName,
					fileId,
					document.isUntitled,
				),
			);

			return lenses;
		} catch (error) {
			const message = 'Error parsing Test Input View Content!';
			Logger.error(error, message);
			throw error;
		}
	}

	public resolveCodeLens(
		lens: CodeLens,
		token: CancellationToken,
	): CodeLens | null {
		try {
			if (lens instanceof AddNewUseCaseCodeLens) {
				return resolveAddNewUseCaseCodeLens(lens, token);
			} else if (lens instanceof CreateAllTestCasesCodeLens) {
				return resolveCreateAllTestCasesCodeLens(lens, token);
			} else if (lens instanceof RunAllRunCasesCodeLens) {
				return resolveRunAllRunCasesCodeLens(lens, token);
			} else if (lens instanceof CreateOneTestCaseCodeLens) {
				return resolveCreateOneTestCaseCodeLens(lens, token);
			} else if (lens instanceof RunOneRunCaseCodeLens) {
				return resolveRunOneRunCaseCodeLens(lens, token);
			} else if (lens instanceof DebugOneRunCaseCodeLens) {
				return resolveDebugOneRunCaseCodeLens(lens, token);
			} else if (lens instanceof CloseTextEditorCodeLens) {
				return resolveCloseTextEditorCodeLens(lens, token);
			}
			return null;
		} catch (error) {
			Logger.error(error, 'Error resolving test input view code lenses');
			return null;
		}
	}

	private isTestInputView(document: TextDocument): boolean {
		const firstLineRange = new Range(0, 0, 0, 100);
		const firstLineContent = document.getText(firstLineRange);
		const testInputViewMatchToFind = "function's test cases";
		return firstLineContent.includes(testInputViewMatchToFind);
	}

	private createHeaderCodelenses(
		headerRange: Range,
		functionName: string,
		fileId: FileId,
		documentIsUntitled: boolean,
	): CodeLens[] {
		const createAllTestsCodeLensHeader = new CreateAllTestCasesCodeLens(
			headerRange,
			functionName,
			fileId,
		);
		const runAllTestsCodeLensHeader = new RunAllRunCasesCodeLens(
			headerRange,
			functionName,
			fileId,
		);
		const closeCodeLensHeader = new CloseTextEditorCodeLens(
			headerRange,
			functionName,
			fileId,
			documentIsUntitled,
		);
		return [
			createAllTestsCodeLensHeader,
			runAllTestsCodeLensHeader,
			closeCodeLensHeader,
		];
	}

	private createTestCaseCodelenses(
		testCaseIndex: number,
		testCase: InputViewTestCase,
		functionName: string,
		fileId: FileId,
		documentIsUntitled: boolean,
	): CodeLens[] {
		const createOneTestCodeLens = new CreateOneTestCaseCodeLens(
			testCase.leadingCommentRange,
			functionName,
			fileId,
			testCaseIndex,
		);
		const runOneTestCodeLens = new RunOneRunCaseCodeLens(
			testCase.leadingCommentRange,
			functionName,
			fileId,
			testCaseIndex,
		);
		const debugOneTestCodeLens = new DebugOneRunCaseCodeLens(
			testCase.leadingCommentRange,
			functionName,
			fileId,
			testCaseIndex,
			documentIsUntitled,
		);

		return [createOneTestCodeLens, runOneTestCodeLens, debugOneTestCodeLens];
	}

	private createFooterCodelenses(
		footerRange: Range,
		functionName: string,
		fileId: FileId,
		documentIsUntitled: boolean,
	): CodeLens[] {
		const addNewTestCaseCodeLens = new AddNewUseCaseCodeLens(
			footerRange,
			functionName,
			fileId,
			'test',
		);
		const createAllTestCasesCodeLens = new CreateAllTestCasesCodeLens(
			footerRange,
			functionName,
			fileId,
		);
		const runAllTestsCodeLens = new RunAllRunCasesCodeLens(
			footerRange,
			functionName,
			fileId,
		);
		const closeCodeLens = new CloseTextEditorCodeLens(
			footerRange,
			functionName,
			fileId,
			documentIsUntitled,
		);
		return [
			addNewTestCaseCodeLens,
			createAllTestCasesCodeLens,
			runAllTestsCodeLens,
			closeCodeLens,
		];
	}
}
