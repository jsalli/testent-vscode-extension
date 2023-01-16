import * as path from 'path';
import { glob } from 'glob';
import Mocha from 'mocha';

// __dirname points to "out/test"-folder
export function run() {
	const testWorkspaceFixtureName = process.env.TESTWORKSPACEFIXTURENAME;
	if (!testWorkspaceFixtureName) {
		throw new Error(
			'Environment variable "testWorkspaceFixtureName" was not set',
		);
	}
	const testSuitePath = path.join(__dirname, 'suite', testWorkspaceFixtureName);
	return mochaRun(testSuitePath);
}

export function mochaRun(testsRoot: string): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 0,
		parallel: false,
	});

	return new Promise((c, e) => {
		glob(
			'**/**.test.js',
			{ cwd: testsRoot },
			(err: Error | null, files: string[]): void => {
				if (err != null) {
					console.error('=== Error reading test suite files');
					console.error(err);
					return e(err);
				}

				// Add files to the test suite
				files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

				try {
					// Run the mocha test
					mocha.run((failures) => {
						if (failures > 0) {
							console.error('=== Tests failed');
							e(new Error(`${failures} tests failed.`));
						} else {
							c();
						}
					});
				} catch (err) {
					console.error('=== Error executing tests');
					console.error(err);
					e(err);
				}

				return undefined;
			},
		);
	});
}
