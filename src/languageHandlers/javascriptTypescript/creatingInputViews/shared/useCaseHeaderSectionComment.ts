import { capitalizeFirstLetter } from '@testent/shared';

function useCaseHeaderSectionComment({
	useCaseId,
	mode,
}: {
	useCaseId: string;
	mode: 'run' | 'test';
}) {
	return `
@testent ${mode}-case ${useCaseId}
=======================
${capitalizeFirstLetter(mode)} case ID ${useCaseId}
=======================
`;
}

export function testCaseHeaderSectionComment(testCaseId: string): string {
	return useCaseHeaderSectionComment({
		useCaseId: testCaseId,
		mode: 'test',
	});
}

export function runCaseHeaderSectionComment(runCaseId: string): string {
	return useCaseHeaderSectionComment({
		useCaseId: runCaseId,
		mode: 'run',
	});
}
