import { posix } from 'path';
import {
	TestCaseOptions,
	TestGeneratorOptions,
} from '@testent/shared-test-generation';
import { TestGenerator } from '@testent/test-generator';
import { Container } from '../container';
import { FileId } from '../languageHandlers/common/fileId';
import { JsTsLanguageHandler } from '../languageHandlers/javascriptTypescript/JsTsLanguageHandler';
import { Logger } from '../logger';
import { TestGenerationProgress } from '../ui/TestGenerationProgress';
import { getWorkspaceRootFolder, writeToFileSync } from '../utils/fsUtils';
import { ensureActiveEditor } from '../utils/utils';
import { command, Command, Commands } from './common';

export interface CreateTestCasesArgs {
	functionName: string;
	fileId: FileId;
	testCaseIndex?: number;
	// The returnContentForTest bit is set in testing to assert the generated test.
	// When returnContentForTest is set, nothing is written to disk.
	returnContentForTest?: true | undefined;
}

export type CreateTestCasesReturn =
	| undefined
	| string
	| {
			filePath: string;
			fileName: string;
			fileContent: string;
	  };

@command()
export class CreateTestCasesCommand extends Command {
	constructor() {
		super([Commands.CreateOneTestCase, Commands.CreateAllTestCases]);
	}

	public async execute(
		args: CreateTestCasesArgs,
	): Promise<CreateTestCasesReturn> {
		const progress = new TestGenerationProgress();
		try {
			const activeEditor = ensureActiveEditor(args.fileId);

			if (
				JsTsLanguageHandler.languageIdIsTypeScript(
					activeEditor.document.languageId,
				) ||
				JsTsLanguageHandler.languageIdIsJavaScript(
					activeEditor.document.languageId,
				)
			) {
				const testableFunction =
					await JsTsLanguageHandler.getTestableFunctionByFileId(args.fileId);

				const testSuiteData = JsTsLanguageHandler.parseTestInputView(
					activeEditor.document,
					testableFunction,
					args.testCaseIndex,
				);

				Container.instance.telemetryModule.sendTelemetryEvent(
					'CreateUnitTests',
					{ languageId: testableFunction.languageId },
					{ numberOfCases: testSuiteData.testCaseData.length },
				);

				const recordings =
					await JsTsLanguageHandler.runFunctionWithRecorderForTestCases(
						testableFunction,
						testSuiteData,
					);

				const testCaseOpts: TestCaseOptions[] = testSuiteData.testCaseData.map(
					(testCase) => {
						return {
							internalFunctionExpects: testCase.internalFunctionExpects,
							itDescription: testCase.caseDescription,
						};
					},
				);
				const testGenOptions: TestGeneratorOptions = {
					testSuiteDescription: testSuiteData.testSuiteDescription,
					testCaseOptions: testCaseOpts,
				};

				const testGenerator = new TestGenerator(
					testableFunction,
					recordings,
					testGenOptions,
					Logger,
				);
				const testCodes = testGenerator.generateTestFile();

				if (args.returnContentForTest === undefined) {
					writeToFileSync(
						testCodes.filePath,
						testCodes.fileName,
						testCodes.fileContent,
					);
				}

				Logger.log(
					`==Generated test==\n  - File Name: ${testCodes.fileName}\n  - File Path: ${testCodes.filePath}`,
				);

				progress.endProgress({
					fileName: testCodes.fileName,
					filePath: posix.relative(
						getWorkspaceRootFolder(),
						testCodes.filePath,
					),
				});

				if (args.returnContentForTest === true) {
					return {
						filePath: testCodes.filePath,
						fileName: testCodes.fileName,
						fileContent: testCodes.fileContent,
					};
				}

				return undefined;
			}
			// else if (languageId === 'Python') {
			//   Handle Python stuff
			// }
			throw new Error(
				`Unsupported languageId: "${activeEditor.document.languageId}" for creating unit tests`,
			);
		} catch (error) {
			progress.endProgress({ error: error });

			const logMessage = 'Could not create unit test';
			// if (PRODUCTION === false) {
			Logger.error(error, logMessage);
			// }

			return error.message as string;
		}
	}
}
