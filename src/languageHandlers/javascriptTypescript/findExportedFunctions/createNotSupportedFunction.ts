import { DefaultExport, NamedExport } from '@testent/shared';
import {
	CodePosition,
	KnownError,
	NotSupportedFunction,
} from '@testent/shared-code-processing';

export function createNotSupportedFunction(
	error: any,
	{
		// id,
		name,
		functionType,
		codePosition,
		sourceFilePath,
		languageId,
	}: {
		// id: string;
		name: string;
		functionType: DefaultExport | NamedExport;
		codePosition: CodePosition;
		sourceFilePath: string;
		languageId: string;
	},
): NotSupportedFunction {
	let shortFailReason: string;
	let longFailReason: string | undefined;
	let githubIssueUrl: string | undefined;
	if (error instanceof KnownError) {
		shortFailReason = error.shortFailReason;
		longFailReason = error.longFailReason;
		githubIssueUrl = error.githubIssueUrl;
	} else {
		shortFailReason = error.message;
	}
	const notSuppFunc = new NotSupportedFunction({
		// id,
		name,
		functionType,
		codePosition,
		sourceFilePath,
		languageId,
		shortFailReason,
		longFailReason,
		githubIssueUrl,
	});
	return notSuppFunc;
}
