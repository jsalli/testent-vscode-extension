import { Position, Range, TextDocument } from 'vscode';
import { InputViewFooter } from '../common';

export function findFooterSection(document: TextDocument): InputViewFooter {
	const footerStartPosition = new Position(document.lineCount - 1, 0);
	const footerEndPosition = new Position(
		document.lineCount - 1,
		document.lineAt(document.lineCount - 1).text.length,
	);
	const footerRange = new Range(footerStartPosition, footerEndPosition);
	const ioViewFooter = new InputViewFooter(footerRange);
	return ioViewFooter;
}
