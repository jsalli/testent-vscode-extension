import { TestableFunction } from '@testent/shared-code-processing';
import { CompilerOptions } from 'typescript';
import { CommonJSModule, ESModule } from '../../../../constants';
import { JsTsLanguageHandler } from '../../JsTsLanguageHandler';
import { detectJsModuleOptions } from './detectJsModuleOptions';
import { detectTsModuleOptions } from './detectTsModuleOptions';
import { ensureJsTsLanguageId } from './ensureJsTsLanguageId';

export async function detectJsTsModuleOptions(
	testableFunction: TestableFunction,
): Promise<{
	languageId: 'javascript' | 'typescript';
	moduleType: typeof CommonJSModule | typeof ESModule;
	compilerOptions: CompilerOptions;
	tsConfigJsonFileAbsPath?: string;
}> {
	let moduleType: typeof CommonJSModule | typeof ESModule;
	let compilerOptions: CompilerOptions;
	let tsConfigJsonFileAbsPath: string | undefined;

	const languageId = ensureJsTsLanguageId(testableFunction.languageId);

	if (JsTsLanguageHandler.languageIdIsJavaScript(languageId)) {
		({ moduleType, compilerOptions } = await detectJsModuleOptions(
			testableFunction.sourceFilePath,
		));
	} else if (JsTsLanguageHandler.languageIdIsTypeScript(languageId)) {
		({ moduleType, compilerOptions, tsConfigJsonFileAbsPath } =
			await detectTsModuleOptions(testableFunction.sourceFilePath));
	} else {
		throw new Error();
	}
	return {
		languageId,
		moduleType,
		compilerOptions,
		tsConfigJsonFileAbsPath,
	};
}
