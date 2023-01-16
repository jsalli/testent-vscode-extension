import { JsTsLanguageHandler } from '../../JsTsLanguageHandler';

export function ensureJsTsLanguageId(
	languageIdRaw: string,
): 'javascript' | 'typescript' {
	let languageId: 'javascript' | 'typescript';
	if (JsTsLanguageHandler.languageIdIsJavaScript(languageIdRaw)) {
		languageId = 'javascript';
	} else if (JsTsLanguageHandler.languageIdIsTypeScript(languageIdRaw)) {
		languageId = 'typescript';
	} else {
		throw new Error(
			`Unsupported languageId for Javascript and Typescipt code processing. Got: ${languageIdRaw}`,
		);
	}
	return languageId;
}
