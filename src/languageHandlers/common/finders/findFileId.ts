import { FileId } from '../fileId';

const ioViewFileIdRegex = /^(@testent file-id )(.*)$/gm;

export function findFileId(documentContent: string): FileId | undefined {
	const headerMatches = Array.from(documentContent.matchAll(ioViewFileIdRegex));
	if (headerMatches.length === 0) {
		return undefined;
	}

	const fileIdStr = headerMatches[0][2];
	const fileIdObj = JSON.parse(fileIdStr);
	if ('filePath' in fileIdObj && 'functionName' in fileIdObj) {
		return fileIdObj as FileId;
	}
	throw new Error(
		'The "file-id" did not contain values "filePath" and/or "functionName". Please create the input view again',
	);
}
