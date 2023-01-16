import {
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	DocumentSelector,
	Event,
	EventEmitter,
	TextDocument,
} from 'vscode';
import { DocumentSchemes } from '../constants';
import { Container } from '../container';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { codePositionToRange } from '../utils/utils';
import {
	OpenRunInputViewCodeLens,
	resolveOpenRunInputViewCodeLens,
} from './codeLenses/OpenRunInputViewCodeLens';
import {
	OpenTestInputViewCodeLens,
	resolveOpenTestInputViewCodeLens,
} from './codeLenses/OpenTestInputViewCodeLens';
import {
	resolveShowNotSupportedFunctionCodeLens,
	ShowNotSupportedFunctionCodeLens,
} from './codeLenses/ShowNotSupportedFunctionCodeLens';

export class SourceViewCodeLensProvider implements CodeLensProvider {
	public static readonly selector: DocumentSelector = [
		{
			scheme: DocumentSchemes.File,
			language: 'typescript',
		},
		{
			scheme: DocumentSchemes.File,
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
		let foundFunctions: (TestableFunction | NotSupportedFunction)[];
		if (
			(JsTsLanguageHandler.languageIdIsTypeScript(document.languageId) ||
				JsTsLanguageHandler.languageIdIsJavaScript(document.languageId)) &&
			!document.isUntitled
		) {
			foundFunctions = JsTsLanguageHandler.parseTestableFunctions(document);
		}
		// else if(pythonLanguageHandler.documentIsPythonSourceFile) {
		// foundFunctions = pythonLanguageHandler.parseTestableFunctions(document);
		// }
		else {
			throw new Error(`Unsupported language ${document.languageId}`);
		}

		if (
			token.isCancellationRequested ||
			foundFunctions === undefined ||
			foundFunctions.length === 0
		) {
			return [];
		}

		const lenses: CodeLens[] = [];
		for (const func of foundFunctions) {
			lenses.push(...this.provideCodeLensesForFoundFunction(func));
		}
		return lenses;
	}

	private provideCodeLensesForFoundFunction(
		foundFunction: TestableFunction | NotSupportedFunction,
	): CodeLens[] {
		const codeLenses: CodeLens[] = [];

		const range = codePositionToRange(foundFunction.codePosition);

		if (foundFunction instanceof TestableFunction) {
			if (
				JsTsLanguageHandler.languageIdIsTypeScript(foundFunction.languageId)
			) {
				codeLenses.push(new OpenTestInputViewCodeLens(foundFunction, range));
			}
			codeLenses.push(new OpenRunInputViewCodeLens(foundFunction, range));
		} else {
			codeLenses.push(
				new ShowNotSupportedFunctionCodeLens(foundFunction, range),
			);
		}

		return codeLenses;
	}

	public resolveCodeLens(
		lens: CodeLens,
		token: CancellationToken,
	): CodeLens | null {
		try {
			if (lens instanceof OpenTestInputViewCodeLens) {
				return resolveOpenTestInputViewCodeLens(lens, token);
			} else if (lens instanceof OpenRunInputViewCodeLens) {
				return resolveOpenRunInputViewCodeLens(lens, token);
			} else if (lens instanceof ShowNotSupportedFunctionCodeLens) {
				return resolveShowNotSupportedFunctionCodeLens(lens, token);
			}
			return null;
		} catch (error) {
			Logger.error(error, 'Error resolving source view code lenses');
			return null;
		}
	}
}
