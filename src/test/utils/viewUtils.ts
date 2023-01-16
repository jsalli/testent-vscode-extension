import {
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import {
	commands,
	Range,
	TextDocument,
	TextEdit,
	ViewColumn,
	window,
	workspace,
	WorkspaceEdit,
} from 'vscode';
import {
	Commands,
	executeCommand,
	OpenRunInputViewArgs,
	OpenRunInputViewReturn,
	OpenTestInputViewArgs,
	OpenTestInputViewReturn,
} from '../../commands';
import { FileId } from '../../languageHandlers/common/fileId';
import { JsTsLanguageHandler } from '../../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { sleepMilliSeconds } from './utils';
import { createFile } from './fileUtils';
import { normalizePath } from '@testent/shared';

export async function openSourceFileAndInputView(
	sourceFilePath: string,
	functionNameToOpen: string,
	inputViewType: 'run' | 'test',
): Promise<{ fileId: FileId; testableFunction: TestableFunction }> {
	const document = await openDocument({ sourceFilePath });
	const testableFunction = findTestableFunction(document, functionNameToOpen);
	await openInputView(testableFunction, inputViewType);
	const fileId: FileId = {
		filePath: normalizePath(document.uri.fsPath),
		functionName: functionNameToOpen,
	};
	return { fileId, testableFunction };
}

export function findTestableFunction(
	sourceFileDocument: TextDocument,
	functionNameToFind: string,
) {
	let foundFunctions: (TestableFunction | NotSupportedFunction)[];
	if (
		(JsTsLanguageHandler.languageIdIsTypeScript(
			sourceFileDocument.languageId,
		) ||
			JsTsLanguageHandler.languageIdIsJavaScript(
				sourceFileDocument.languageId,
			)) &&
		!sourceFileDocument.isUntitled
	) {
		foundFunctions =
			JsTsLanguageHandler.parseTestableFunctions(sourceFileDocument);
	}
	// else if(pythonLanguageHandler.documentIsPythonSourceFile) {
	// foundFunctions = pythonLanguageHandler.parseTestableFunctions(document);
	// }
	else {
		throw new Error(`Unsupported language ${sourceFileDocument.languageId}`);
	}

	if (foundFunctions === undefined || foundFunctions.length === 0) {
		throw new Error(
			`Could not find testable function from file "${sourceFileDocument.fileName}"`,
		);
	}

	const foundFunction = findTestableFunctionByName(
		foundFunctions,
		functionNameToFind,
	);

	if (foundFunction instanceof NotSupportedFunction) {
		throw new Error(
			`First found function is of type "NotSupportedFunction" in file "${sourceFileDocument.fileName}"`,
		);
	}

	return foundFunction;
}

export async function openInputView(
	testableFunction: TestableFunction,
	inputViewType: 'run' | 'test',
	inputOutputViewContentOverride?: string,
): Promise<void> {
	const args = {
		testableFunction: testableFunction,
		showOptions: {
			viewColumn: ViewColumn.Beside,
		},
	};

	if (inputViewType === 'run') {
		await executeCommand<OpenRunInputViewArgs, OpenRunInputViewReturn>(
			Commands.OpenRunInputView,
			args,
		);
	} else {
		await executeCommand<OpenTestInputViewArgs, OpenTestInputViewReturn>(
			Commands.OpenTestInputView,
			args,
		);
	}

	if (inputOutputViewContentOverride) {
		const activeEditor = window.activeTextEditor;
		if (activeEditor == null) {
			throw new Error('No active editor');
		}
		await overrideDocumentContent(
			activeEditor.document,
			inputOutputViewContentOverride,
		);
	}
}

export async function closeAllOpenTextDocuments(): Promise<void> {
	await commands.executeCommand('workbench.action.closeAllEditors');
}

export async function overrideDocumentContent(
	document: TextDocument,
	newContent: string,
): Promise<void> {
	const textEdits: TextEdit[] = [];
	textEdits.push(TextEdit.replace(new Range(0, 0, 999, 999), newContent));
	const workEdits = new WorkspaceEdit();
	workEdits.set(document.uri, textEdits);
	await workspace.applyEdit(workEdits);
}

export async function openDocument({
	content,
	sourceFilePath,
}: {
	content?: string;
	sourceFilePath?: string;
}): Promise<TextDocument> {
	let document: TextDocument;
	if (content) {
		document = await workspace.openTextDocument({
			language: 'typescript',
			content: content ? content : '',
		});
	} else if (sourceFilePath) {
		document = await workspace.openTextDocument(sourceFilePath);
	} else {
		throw new Error(
			'Neither "content" nor "sourceFilePath" provided to open TextDocument',
		);
	}

	await window.showTextDocument(document, { preview: false });
	if (sourceFilePath) {
		await document.save();
	}
	// This might fix a timing for some other problem giving "document.getText is not a function"
	await sleepMilliSeconds(200);

	return document;
}

export async function createAndOpenDocumentFromContent(
	filePathToCreate: string,
	fileContent: string,
): Promise<TextDocument> {
	await createFile(filePathToCreate, fileContent);
	const inputDocument = await openDocument({
		sourceFilePath: filePathToCreate,
	});
	return inputDocument;
}

function findTestableFunctionByName(
	functionsList: (TestableFunction | NotSupportedFunction)[],
	functionNameToFind: string,
): TestableFunction {
	const foundFunc = functionsList.find((func) => {
		if (func.name === functionNameToFind) {
			return true;
		}
		return false;
	});

	if (foundFunc instanceof NotSupportedFunction) {
		throw new Error(
			'Found function is not "TestableFunction" kind. Got "NotSupportedFunction"',
		);
	}

	if (foundFunc === undefined) {
		throw new Error(
			`Could not find "TestableFunction" with name ${functionNameToFind}`,
		);
	}

	return foundFunc;
}
