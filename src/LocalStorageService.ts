import { Memento } from 'vscode';
import { LocalStorage } from './types/types';

export class LocalStorageService implements LocalStorage {
	constructor(private storage: Memento) {}

	public getValue<T>(key: string): T | null {
		const data = this.storage.get<T>(key);
		if (data === undefined) return null;
		return data;
	}

	public async setValue<T>(key: string, value: T) {
		await this.storage.update(key, value);
	}
}
