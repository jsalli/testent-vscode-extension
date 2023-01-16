import { generateRandomString } from '@testent/shared';
import {
	TestableFunction,
	TestCaseData,
	TestSuiteData,
} from '@testent/shared-code-processing';
import { TextDocument } from 'vscode';
import { getRangesFromDocument } from '../../../utils/utils';
import { findUseCaseInputCodeRanges } from '../../common/finders/findUseCaseInputCodeRanges';
import { createUseCaseData } from './createUseCaseData';
import { parseDescribeSection } from './parseDescribeSection';

export function parseJsTsTestInputView(
	document: TextDocument,
	testableFunction: TestableFunction,
	testCaseIndex?: number,
): TestSuiteData {
	const ioCodeRangeArr = findUseCaseInputCodeRanges(document);
	const ioCodeArr = getRangesFromDocument(document, ioCodeRangeArr);
	const testCaseDataArr: TestCaseData[] = [];
	for (const ioCode of ioCodeArr) {
		const id = generateRandomString();
		const testCaseData = createUseCaseData(id, ioCode, testableFunction);
		if (testCaseData.caseDescription === undefined) {
			throw new Error('Test case does not have a test description');
		}
		if (testCaseData.internalFunctionExpects === undefined) {
			throw new Error(
				'Test case does not have a test internals switch defined',
			);
		}
		testCaseDataArr.push({
			id: testCaseData.id,
			internalFunctionExpects: testCaseData.internalFunctionExpects,
			caseDescription: testCaseData.caseDescription,
			caseInputs: testCaseData.caseInputs,
		});
	}

	const testSuiteDescription = parseDescribeSection(document.getText());

	if (testCaseDataArr.length === 0) {
		throw new Error('No test cases found');
	}

	const testCaseDataSelection =
		testCaseIndex !== undefined
			? [testCaseDataArr[testCaseIndex]]
			: testCaseDataArr;

	return {
		id: generateRandomString(),
		testSuiteDescription,
		testCaseData: testCaseDataSelection,
	};
}
