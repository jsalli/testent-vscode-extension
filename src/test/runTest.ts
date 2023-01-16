import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import { getProjectFilesPathFromOutDir } from './utils/fileUtils';

// At runtime __dirname is at "out/test"-folder
async function main(testWorkspaceFixtureName: string, vsCodeVersion: string) {
	try {
		const testWorkspaceAbsPath = getProjectFilesPathFromOutDir(
			__dirname,
			testWorkspaceFixtureName,
		);

		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		const extensionTestsPath = path.resolve(__dirname, 'mochaRun');

		process.env['TESTWORKSPACEFIXTURENAME'] = testWorkspaceFixtureName;
		// Download VS Code, unzip it and run the integration test
		await runTests({
			extensionDevelopmentPath: extensionDevelopmentPath,
			extensionTestsPath: extensionTestsPath,
			version: vsCodeVersion,
			launchArgs: ['--disable-extensions', testWorkspaceAbsPath],
		});
	} catch (err) {
		console.error('Failed to run tests');
		console.error('===============');
		console.error(err);
		console.error('===============');
		process.exit(1);
	}
}

// process.argv[2] -> testWorkspaceFixtureName
// process.argv[3] -> vsCodeVersion

const defaultTestWorkspaceFixtureName =
	'commonjsMonoRepoTypescriptProjectRushJs';
const defaultVsCodeVersion = '1.58.1';
const testWorkspaceFixtureName =
	process.argv[2] ?? defaultTestWorkspaceFixtureName;
const vsCodeVersion = process.argv[3] ?? defaultVsCodeVersion;

void main(testWorkspaceFixtureName, vsCodeVersion);
