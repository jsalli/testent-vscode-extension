import {
	commands,
	Disposable,
	ExtensionContext,
	Command as VSCommand,
} from 'vscode';
import { Logger } from '../logger';

export const enum Commands {
	DebugOneRunCase = 'testent.debugOneRunCase',
	OpenTestInputView = 'testent.openTestInputView',
	OpenRunInputView = 'testent.openRunInputView',
	RunAllRunCases = 'testent.runAllRunCases',
	RunOneRunCase = 'testent.runOneRunCase',
	CloseTextEditor = 'testent.closeTextEditor',
	AddNewInputCase = 'testent.addNewInputCase',
	CreateAllTestCases = 'testent.createAllTestCases',
	CreateOneTestCase = 'testent.createOneTestCase',
	RunCode = 'testent.runCode',
	ClearTestentExtensionPreferences = 'testent.clearTestentExtensionPreferences',
	NotSupportedFunction = 'testent.notSupportedFunction',
}

interface CommandConstructor {
	new (): Command;
}

const registrableCommands: CommandConstructor[] = [];

export function customCommand<T extends unknown[]>(
	command: Omit<VSCommand, 'arguments'> & { arguments: [...T] },
): VSCommand {
	return command;
}

export function executeCommand<T, R>(
	command: Commands,
	args: T,
): Promise<R | undefined> {
	return new Promise((res, rej) => {
		commands.executeCommand<R | undefined>(command, args).then(
			(value) => {
				res(value);
			},
			(failReason) => {
				const message = `Command "${command}" failed with message: "${failReason}"`;
				Logger.error(message, undefined, {
					dontSendErrorMessage: true,
					alternativeLogMessage: `Command "${command}" failed`,
				});
				rej(failReason);
			},
		);
	});
}

export function command(): ClassDecorator {
	return (target: any) => {
		registrableCommands.push(target);
	};
}

export function registerCommands(context: ExtensionContext): void {
	try {
		for (const c of registrableCommands) {
			context.subscriptions.push(new c());
		}
	} catch (error: any) {
		const message = `Error registering commands:\n${error}`;
		Logger.error(message);
		throw new Error(message);
	}
}

export abstract class Command implements Disposable {
	private readonly disposable: Disposable;

	constructor(command: Commands | Commands[]) {
		if (typeof command === 'string') {
			// Webpack's Define plugin removes this code in production mode.
			if (PRODUCTION === false) {
				Logger.debug(`Registering single command ${command}`);
			}
			this.disposable = commands.registerCommand(
				command,
				(...args: any[]) => this.execute(...args),
				this,
			);

			return;
		}

		const subscriptions = command.map((cmd) =>
			commands.registerCommand(
				cmd,
				(...args: any[]) => this.execute(...args),
				this,
			),
		);
		this.disposable = Disposable.from(...subscriptions);
	}

	dispose() {
		this.disposable.dispose();
	}

	abstract execute(...args: any[]): Promise<any> | any;
}
