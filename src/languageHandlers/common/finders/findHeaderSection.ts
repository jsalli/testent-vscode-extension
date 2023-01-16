import { TextDocument } from 'vscode';
import { InputViewHeader, regexMatchToRange } from '../common';

const ioViewHeaderRegex =
	/^(\/\*)([\s\S]*?)(@testent input-view \S*?[\r\n|\r|\n]([\s\S]*?)\*\/)$/gm;
const ioViewFunctionNameRegex = /^(@testent input-view )(\S*)/gm; // Text is in second capture group

export function findHeaderSection(document: TextDocument): {
	ioViewHeader: InputViewHeader | undefined;
	functionName: string | undefined;
} {
	const text = document.getText();
	const headerMatches = Array.from(text.matchAll(ioViewHeaderRegex));

	if (headerMatches.length === 0) {
		return { ioViewHeader: undefined, functionName: undefined };
	}

	const ioViewHeaderRange = regexMatchToRange(document, headerMatches[0]);
	const ioViewHeader = new InputViewHeader(ioViewHeaderRange);

	const functionName = Array.from(text.matchAll(ioViewFunctionNameRegex))[0][2];

	return { ioViewHeader: ioViewHeader, functionName: functionName };
}
