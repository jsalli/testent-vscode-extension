import { type as platFormType } from 'os';
import { FileId } from '../../../common/fileId';

function headerSectionComment({
	functionName,
	fileIdStr,
	mode,
}: {
	functionName: string;
	fileIdStr: string;
	mode: 'run' | 'test';
}): string {
	return `Give inputs for "${functionName}"-function's ${mode} cases
@testent input-view ${functionName}
@testent file-id ${fileIdStr}
`;
}

export function headerSectionCommentTestInputView({
	functionName,
	fileId,
}: {
	functionName: string;
	fileId: FileId;
}): string {
	if (platFormType() === 'Windows_NT') {
		fileId.filePath = fileId.filePath.replace(/\\/g, '/');
	}
	const fileIdStr = JSON.stringify(fileId);
	return headerSectionComment({ functionName, fileIdStr, mode: 'test' });
}

export function headerSectionCommentRunInputView({
	functionName,
	fileId,
}: {
	functionName: string;
	fileId: FileId;
}): string {
	const fileIdStr = JSON.stringify(fileId);
	return headerSectionComment({ functionName, fileIdStr, mode: 'run' });
}
