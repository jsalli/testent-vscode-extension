import * as assert from 'assert';
import { TextEditor } from 'vscode';
import { getCodeLenses } from '../../../../utils/utils';

/**
 * Expects the source file to have one testable function and thus generates 9 code lenses to the ioView
 * @param activeEditor
 */
export async function ensureTypescriptTestInputViewCodeLenses(
	activeEditor: TextEditor,
): Promise<void> {
	const lenses = await getCodeLenses(activeEditor.document.uri, 11);
	assert.equal(lenses.length, 10);
	assert.equal(lenses[0].command?.title, 'Create all');
	assert.equal(lenses[1].command?.title, 'Run all');
	assert.equal(lenses[2].command?.title, 'Close');
	assert.equal(lenses[3].command?.title, 'Create this');
	assert.equal(lenses[4].command?.title, 'Run this');
	assert.equal(lenses[5].command?.title, 'Debug this');
	assert.equal(lenses[6].command?.title, '+ Add new test case');
	assert.equal(lenses[7].command?.title, 'Create all');
	assert.equal(lenses[8].command?.title, 'Run all');
	assert.equal(lenses[9].command?.title, 'Close');
}
