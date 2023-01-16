const ioViewDescribeTextRegex =
	/^(@testent describe-text\n\*\/\n)([\s\S]*?)(\/\*\n@testent test-case)/gm; // Text is in second capture group

export function findDescribeSection(documentContent: string): string {
	const describeMatches = Array.from(
		documentContent.matchAll(ioViewDescribeTextRegex),
	);

	const describeText = describeMatches[0][2];
	return describeText;
}
