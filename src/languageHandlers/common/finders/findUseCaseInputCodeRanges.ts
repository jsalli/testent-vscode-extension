import { Range, TextDocument } from 'vscode';
import { testCaseRegexMatchesToCodeRange } from '../common';

export const ioViewUseCaseRegex =
	/^(\/\*[\r\n|\r|\n]@testent (test|run)-case)([\s\S]*?)(\*\/)$/gm;

export function findUseCaseInputCodeRanges(document: TextDocument): Range[] {
	const text = document.getText();
	const testCaseCommentMatches = Array.from(text.matchAll(ioViewUseCaseRegex));

	const ioCodeArr: Range[] = [];
	for (let i = 0; i < testCaseCommentMatches.length; i++) {
		const testCaseCodeRange = testCaseRegexMatchesToCodeRange(
			document,
			testCaseCommentMatches[i],
			testCaseCommentMatches[i + 1],
		);
		ioCodeArr.push(testCaseCodeRange);
	}

	return ioCodeArr;
}
