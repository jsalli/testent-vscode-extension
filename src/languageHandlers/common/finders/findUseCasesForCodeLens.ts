import { TextDocument } from 'vscode';
import { InputViewTestCase, regexMatchToRange } from '../common';
import { ioViewUseCaseRegex } from './findUseCaseInputCodeRanges';

export function findUseCasesForCodeLens(
	document: TextDocument,
): InputViewTestCase[] {
	const text = document.getText();
	const testCaseCommentMatches = Array.from(text.matchAll(ioViewUseCaseRegex));

	const testCases: InputViewTestCase[] = [];
	for (const testCaseCommentMatch of testCaseCommentMatches) {
		const testCaseCommentRange = regexMatchToRange(
			document,
			testCaseCommentMatch,
		);

		const testCase = new InputViewTestCase(testCaseCommentRange);
		testCases.push(testCase);
	}
	return testCases;
}
