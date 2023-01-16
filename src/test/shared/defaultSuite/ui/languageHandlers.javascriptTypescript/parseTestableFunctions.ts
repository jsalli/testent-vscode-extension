import * as assert from 'assert';
import {
	NotSupportedFunction,
	TestableFunction,
} from '@testent/shared-code-processing';
import { JsTsLanguageHandler } from '../../../../../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { emptyActiveDocumentContentAndClose } from '../../../../utils/utils';
import { openDocument } from '../../../../utils/viewUtils';

export const jsTsParseTestableFunctions1 = {
	name: 'Testing parseTestableFunctions -> TestableFunction',
	callback: async () => {
		const parseableContent = `
			export function capitalizeFirstLetter(text: string): string {
				return text.charAt(0).toUpperCase() + text.slice(1);
			}`;

		const document = await openDocument({ content: parseableContent });
		const result = JsTsLanguageHandler.parseTestableFunctions(document);

		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0] instanceof TestableFunction, true);
		assert.strictEqual(result[0].name, 'capitalizeFirstLetter');

		await emptyActiveDocumentContentAndClose();
	},
};

export const jsTsParseTestableFunctions2 = {
	name: 'Testing parseTestableFunctions -> NotSupportedFunction, Object destructing',
	callback: async () => {
		const parseableContent = `
			export function capitalizeFirstLetter({text: string}): string {
				return text.charAt(0).toUpperCase() + text.slice(1);
			}`;

		const document = await openDocument({ content: parseableContent });
		const result = JsTsLanguageHandler.parseTestableFunctions(document);

		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0] instanceof NotSupportedFunction, true);
		assert.strictEqual(
			(result[0] as NotSupportedFunction).shortFailReason,
			'Object destructing in function arguments is not supported yet',
		);

		await emptyActiveDocumentContentAndClose();
	},
};

export const jsTsParseTestableFunctions3 = {
	name: 'Testing parseTestableFunctions -> NotSupportedFunction, Array destructing',
	callback: async () => {
		const parseableContent = `
			export function capitalizeFirstLetter([text: string]): string {
				return text.charAt(0).toUpperCase() + text.slice(1);
			}`;

		const document = await openDocument({ content: parseableContent });
		const result = JsTsLanguageHandler.parseTestableFunctions(document);

		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0] instanceof NotSupportedFunction, true);
		assert.strictEqual(
			(result[0] as NotSupportedFunction).shortFailReason,
			'Array destructing in function arguments is not supported yet',
		);

		await emptyActiveDocumentContentAndClose();
	},
};
