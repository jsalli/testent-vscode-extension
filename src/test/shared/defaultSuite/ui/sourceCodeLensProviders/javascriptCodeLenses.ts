import * as assert from 'assert';
import { join } from 'path';
import { commands } from 'vscode';
import { getLenses } from './shared';

export const sourceCodeLensJavascriptSet1 = {
	name(testWorkspaceFixtureName: string): string {
		return `Testing codelens for source files for ${testWorkspaceFixtureName}. Set 1`;
	},
	// srcCodeLensTestFolderPath is relative to the test project's root path
	callback(
		testWorkspaceFixtureName: string,
		srcCodeLensTestFolderPath: string,
	): () => Promise<void> {
		return async () => {
			const testFilePathRelToTestProjectRoot = join(
				srcCodeLensTestFolderPath,
				'testFunctions1.js',
			);
			const lenses = await getLenses(
				testWorkspaceFixtureName,
				testFilePathRelToTestProjectRoot,
			);
			assert.equal(lenses.length, 3);
			assert.equal(lenses[0].command?.title, 'Run or Debug Function');
			assert.equal(lenses[1].command?.title, 'Run or Debug Function');
			assert.equal(lenses[2].command?.title, 'Run or Debug Function');

			await commands.executeCommand('workbench.action.closeActiveEditor');
		};
	},
};

export const sourceCodeLensJavascriptSet2 = {
	name(testWorkspaceFixtureName: string): string {
		return `Testing codelens for source files for ${testWorkspaceFixtureName}. Set 2`;
	},
	// srcCodeLensTestFolderPath is relative to the test project's root path
	callback(
		testWorkspaceFixtureName: string,
		srcCodeLensTestFolderPath: string,
	): () => Promise<void> {
		return async () => {
			const testFilePathRelToTestProjectRoot = join(
				srcCodeLensTestFolderPath,
				'testFunctions2.js',
			);
			const lenses = await getLenses(
				testWorkspaceFixtureName,
				testFilePathRelToTestProjectRoot,
			);
			assert.equal(lenses.length, 3);
			assert.equal(
				lenses[0].command?.title,
				'Array destructing in function arguments is not supported yet',
			);
			assert.equal(
				lenses[1].command?.title,
				'Object destructing in function arguments is not supported yet',
			);
			assert.equal(lenses[2].command?.title, 'Run or Debug Function');

			await commands.executeCommand('workbench.action.closeActiveEditor');
		};
	},
};
