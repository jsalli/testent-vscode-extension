import { ExtensionContext } from 'vscode';
import { registerCommands } from './commands';
import { configuration, Configuration } from './configuration';
import { Container } from './container';
import { Logger } from './logger';

export function activate(context: ExtensionContext) {
	try {
		Logger.configure(context, configuration.get('logging.outputLevel'));

		Configuration.configure(context);
		const cfg = configuration.get();
		const container = Container.create(context, cfg);
		container.onReady(() => {
			registerCommands(context);
		});
		container.ready();

		let startMessage = 'Extension started';
		if (PRODUCTION === false) {
			startMessage = `${startMessage} in development build`;
		}
		Logger.log(startMessage);
	} catch (error) {
		Logger.error(error, 'Extension could not start');
	}
}

export function deactivate(): void {}
