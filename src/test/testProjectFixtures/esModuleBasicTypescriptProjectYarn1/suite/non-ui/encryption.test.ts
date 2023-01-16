import { defaultEncryptionTests } from '../../../../shared/defaultSuite/non-ui/encryption/defaultEncryptionTests';

async function runTests() {
	const testWorkspaceFixtureName = process.env.TESTWORKSPACEFIXTURENAME;
	if (!testWorkspaceFixtureName) {
		throw new Error(
			'Environment variable "testWorkspaceFixtureName" was not set',
		);
	}

	await defaultEncryptionTests(testWorkspaceFixtureName);
}

void runTests();
