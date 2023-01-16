import { generateRandomString } from '@testent/shared';
import { RunCaseData, TestableFunction } from '@testent/shared-code-processing';
import { TextDocument } from 'vscode';
import { getRangesFromDocument } from '../../../utils/utils';
import { findUseCaseInputCodeRanges } from '../../common/finders/findUseCaseInputCodeRanges';
import { createUseCaseData } from './createUseCaseData';

export function parseJsTsRunInputView(
	document: TextDocument,
	testableFunction: TestableFunction,
	runCaseIndex?: number,
): RunCaseData[] {
	const runCaseDataArr: RunCaseData[] = [];

	const ioCodeRangeArr = findUseCaseInputCodeRanges(document);
	const ioCodeArr = getRangesFromDocument(document, ioCodeRangeArr);
	for (const ioCode of ioCodeArr) {
		const id = generateRandomString();
		const testCaseData = createUseCaseData(id, ioCode, testableFunction);

		runCaseDataArr.push(testCaseData);
	}

	if (runCaseDataArr.length === 0) {
		throw new Error('No run cases found');
	}

	return runCaseIndex !== undefined
		? [runCaseDataArr[runCaseIndex]]
		: runCaseDataArr;
}
