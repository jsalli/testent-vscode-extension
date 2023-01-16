import { KnownError } from '@testent/shared-code-processing';
import { KnownErrorNotification } from './KnownErrorNotification';
import { UnknownErrorNotification } from './UnknownErrorNotification';

export class ErrorNotification {
	constructor(error: any) {
		if (error instanceof KnownError) {
			new KnownErrorNotification(error.longFailReason, error.githubIssueUrl);
		} else {
			new UnknownErrorNotification(error.message ?? error);
		}
	}
}
