import * as assert from 'assert';
import { join } from 'path';
import { decrypt, encrypt } from '@testent/shared';
import { readFileFromTestExpectsAndFixtures } from '../../../../utils/fileUtils';

export function defaultEncryptionTests(
	testWorkspaceFixtureName: string,
): Promise<void> {
	return new Promise((res) => {
		suite('Extension Test Suite: Record Encryption', () => {
			suiteTeardown(() => {
				res();
			});

			test('Testing encryption of JSON recording, 1', async () => {
				const fileData = await readFileFromTestExpectsAndFixtures(
					testWorkspaceFixtureName,
					join('apiFunctions.getUserDetailsById', 'recordings.json'),
				);

				const encryptedJson = encrypt(fileData);
				const decryptedJson = decrypt(encryptedJson);

				assert.strictEqual(fileData, decryptedJson);
			});

			test('Testing encryption of JSON recording, 2', async () => {
				const fileData = await readFileFromTestExpectsAndFixtures(
					testWorkspaceFixtureName,
					join('apiFunctions.getUserDetailsByIdTryCatch', 'recordings.json'),
				);

				const encryptedJson = encrypt(fileData);
				const decryptedJson = decrypt(encryptedJson);

				assert.strictEqual(fileData, decryptedJson);
			});

			test('Testing encryption of JSON recording, 3', async () => {
				const fileData = await readFileFromTestExpectsAndFixtures(
					testWorkspaceFixtureName,
					join('createMessage.createMessage', 'recordings.json'),
				);

				const encryptedJson = encrypt(fileData);
				const decryptedJson = decrypt(encryptedJson);

				assert.strictEqual(fileData, decryptedJson);
			});
		});
	});
}
