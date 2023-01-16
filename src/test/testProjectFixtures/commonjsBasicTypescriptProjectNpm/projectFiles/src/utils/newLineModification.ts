/**
 * Cut string from the first new line and return the first part
 *
 * @param text
 * @returns
 */
 export function cutFromNewLine(text: string): string {
	const list = text.split('\n');
	return list[0];
}

/**
 * Replace \\n character for the first one and \n for the second one if it is not preceeded by an other \-character
 *
 * @param code
 * @returns
 */
export function escapeInCodeNewlines(code: string): string[] {
	const replace1 = code.replaceAll('\\n', '\\\\n');
	// const replace2 = code.replaceAll(/(?<!\\)\\n/g, '\\\\n');
	// return [`Escaped 1: ${replace1}`, `Escaped 2: ${replace2}`];
	return [`Escaped 1: ${replace1}`]
}