import { join } from 'path';
import { FileId } from '../../../../../languageHandlers/common/fileId';
import { readFileFromTestExpectsAndFixtures } from '../../../../utils/fileUtils';
import { getNextRandomIdentifier } from '../../../../../languageHandlers/javascriptTypescript/creatingInputViews/shared/createRandomIdentifier';

// Index to keep track of how many different randomIdentifiers have been asked to generate
// to keep random identifiers in expected content the same as in generated content.
let baseIndexOfRandomIdentifier = -1;

/**
 * Read the expected content from file on disk.
 * Remove carrier return if exists from the returned string
 *
 * @param fileId
 * @param testProjectFixtureName
 * @param pathPats
 * @returns
 */
export async function getExpectedContent(
	fileId: FileId,
	testProjectFixtureName: string,
	pathToExpectedContent: string,
): Promise<string> {
	const expectedContent = await readFileFromTestExpectsAndFixtures(
		testProjectFixtureName,
		join(pathToExpectedContent),
	);

	return replaceValuesToOverride(expectedContent, fileId);
}

export function replaceValuesToOverride(content: string, fileId: FileId) {
	// The fileId is dynamic and depends on the folder structure on your PC
	// so we need to replace it with the real value
	let updatedExpectedContent = content.replace(
		'**file-id-here**',
		JSON.stringify(fileId),
	);

	const testCaseReplaceMatcher = /__test_case_id_here__([0-9]+)/gm;
	const matches = updatedExpectedContent.matchAll(testCaseReplaceMatcher);

	let lastUseCaseIndex: number | undefined = undefined;

	for (const [index, match] of [...matches].entries()) {
		if (match.index === undefined) {
			throw new Error('Error replacing test-case-id placeholders');
		}
		const currentUseCaseIndex = Number(match[1]);
		if (lastUseCaseIndex !== currentUseCaseIndex) {
			// Keep track of new use cases indexes and increase when new index has been found
			baseIndexOfRandomIdentifier += 1;
			lastUseCaseIndex = currentUseCaseIndex;
		}
		const randomIdentifier = getNextRandomIdentifier(
			baseIndexOfRandomIdentifier,
		);

		// The content of variable updatedExpectedContent gets shorter with every replace so
		// we need to keep track of the corrected index
		const indexChange =
			index === 0 ? 0 : (match[0].length - randomIdentifier.length) * index;

		const startIndex = match.index - indexChange;
		const endIndex = match.index + match[0].length - indexChange;
		updatedExpectedContent = replaceBetween(
			updatedExpectedContent,
			startIndex,
			endIndex,
			randomIdentifier,
		);
	}

	return updatedExpectedContent.replace(/\r/g, '');
}

function replaceBetween(
	origin: string,
	startIndex: number,
	endIndex: number,
	insertion: string,
): string {
	return `${origin.substring(0, startIndex)}${insertion}${origin.substring(
		endIndex,
	)}`;
}
