import { Container } from '../container';
import { Logger } from '../logger';
import { StorageKeys } from '../storage';
import { command, Command, Commands } from './common';

@command()
export class ClearTestentExtensionPreferences extends Command {
	constructor() {
		super(Commands.ClearTestentExtensionPreferences);
	}

	async execute(): Promise<void> {
		try {
			const container = Container.instance;

			for (const key of Object.keys(StorageKeys)) {
				await container.storage.store(key as StorageKeys, undefined);
			}

			Logger.log("Testent extension's stored preferences have been cleared");
		} catch (error) {
			const logMessage = "Error clearing Testent extension's preferences";
			Logger.error(error, logMessage);
			throw error;
		}
	}
}
