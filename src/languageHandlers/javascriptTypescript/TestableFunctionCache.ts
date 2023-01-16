import { normalizePath } from '@testent/shared';
import {
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import { workspace } from 'vscode';
import { FileId } from '../../languageHandlers/common/fileId';

export class TestableFunctionCache {
	private testableFunctionCache: Map<
		/*file path*/ string,
		Map</*function name*/ string, TestableFunction>
	> = new Map();

	constructor() {
		// Clear cache when document is closed
		workspace.onDidCloseTextDocument((textDoc) => {
			this.testableFunctionCache.delete(textDoc.uri.path);
		});

		// Clear cache when a file is renamed
		workspace.onDidRenameFiles((renamedFiles) => {
			renamedFiles.files.forEach((renamedFileEvent) => {
				const filePath = renamedFileEvent.oldUri.path;
				this.testableFunctionCache.delete(filePath);
			});
		});
	}

	/**
	 *
	 * @param documentFsPath The "document.uri.fsPath" variable
	 * @param foundFunctions
	 */
	public addFunctionToCache(
		documentFsPath: string,
		foundFunctions: (TestableFunction | NotSupportedFunction)[],
	): void {
		this.testableFunctionCache.delete(documentFsPath);
		const funcCache = new Map</*function name*/ string, TestableFunction>();
		for (const func of foundFunctions) {
			if (func instanceof NotSupportedFunction) {
				continue;
			}
			funcCache.set(func.name, func);
		}
		this.testableFunctionCache.set(documentFsPath, funcCache);
	}

	public getTestableFunction(fileId: FileId): TestableFunction | undefined {
		const normFilePath = normalizePath(fileId.filePath);
		let funcListInFile: Map<string, TestableFunction>;
		if (this.testableFunctionCache.has(normFilePath)) {
			funcListInFile = this.testableFunctionCache.get(normFilePath)!;
		} else {
			return undefined;
		}

		if (funcListInFile.has(fileId.functionName)) {
			return funcListInFile.get(fileId.functionName)!;
		}
		throw new Error(
			`Could not find function named "${fileId.functionName}" from file "${normFilePath}"`,
		);
	}
}
