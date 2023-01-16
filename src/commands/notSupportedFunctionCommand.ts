import { Logger } from '../logger';
import { KnownErrorNotification } from '../ui/KnownErrorNotification';
import { command, Command, Commands } from './common';

export interface NotSupportedFunctionArgs {
	functionName: string;
	sourceFilePath: string;
	message: string;
	url: string | undefined;
}

export type NotSupportedFunctionReturn = void;

@command()
export class NotSupportedFunctionCommand extends Command {
	constructor() {
		super(Commands.NotSupportedFunction);
	}

	execute(args: NotSupportedFunctionArgs): NotSupportedFunctionReturn {
		try {
			new KnownErrorNotification(args.message, args.url);
		} catch (error) {
			const logMessage = 'Could not execute notSupportedFunction command';
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
