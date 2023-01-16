import {
	Disposable,
	Event,
	EventEmitter,
	ExtensionContext,
	SecretStorageChangeEvent,
} from 'vscode';

export class Storage implements Disposable {
	private _onDidChangeSecrets = new EventEmitter<SecretStorageChangeEvent>();
	get onDidChangeSecrets(): Event<SecretStorageChangeEvent> {
		return this._onDidChangeSecrets.event;
	}

	private readonly _disposable: Disposable;
	constructor(private readonly context: ExtensionContext) {
		this._disposable = this.context.secrets.onDidChange((e) =>
			this._onDidChangeSecrets.fire(e),
		);
	}

	dispose(): void {
		this._disposable?.dispose();
	}

	get<T>(key: StorageKeys): T | undefined;
	get<T>(key: StorageKeys, defaultValue: T): T;
	get<T>(key: StorageKeys, defaultValue?: T): T | undefined {
		return this.context.globalState.get(key, defaultValue);
	}

	async delete(key: StorageKeys): Promise<void> {
		return this.context.globalState.update(key, undefined);
	}

	async store<T>(key: StorageKeys, value: T): Promise<void> {
		return this.context.globalState.update(key, value);
	}
}

export enum StorageKeys {
	WelcomeViewViewed = 'testent:views:welcome:',
	ShowNewUnitTestGeneratedNotification = 'testent:notification:newUnitTestGenerated:show',
}
