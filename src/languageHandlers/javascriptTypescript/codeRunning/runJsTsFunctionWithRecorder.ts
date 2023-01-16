import { join, parse, relative } from 'path';
import {
	CodeProcessor,
	CodeProcessorConfig,
	obfuscateJsCode,
	transpileToJs,
} from '@testent/code-preprocessor';
import { createCodeToRunAndRecordFunction } from '@testent/invoking-code-creator';
import { normalizeJoin } from '@testent/shared';
import {
	TestableFunction,
	TestSuiteData,
} from '@testent/shared-code-processing';
import { RecordingStorageDataJSON } from '@testent/shared-recording';
import { CompilerOptions } from 'typescript';
import { ExtensionMode } from 'vscode';
import { configuration } from '../../../configuration';
import { Container } from '../../../container';
import { Logger } from '../../../logger';
import { findUp } from '../../../utils/findUp/findUp';
import {
	clearTempFolder,
	getExtensionAbsPath,
	makeFileToTempFolder,
} from '../../../utils/fsUtils';
import { runCodeInExternalProcesssWithEval } from './runRecorderInExternalProcess';
import { detectJsTsModuleOptions } from './shared/detectJsTsModuleOptions';

export async function runJsTsFunctionWithRecorder(
	testableFunction: TestableFunction,
	testSuiteData: TestSuiteData,
): Promise<RecordingStorageDataJSON[]> {
	const { languageId, moduleType, compilerOptions, tsConfigJsonFileAbsPath } =
		await detectJsTsModuleOptions(testableFunction);

	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			await clearTempFolder();
		}
	}

	const sourceFolderAbsPath = await getSrcFolderPath(testableFunction);
	const sourceFileFolderAbsDir = parse(testableFunction.sourceFilePath).dir;

	const {
		recorderFileAbsPath,
		recorderSaverServiceFileAbsPath,
		libsFolderAbsPath,
	} = getLibraryPaths(sourceFileFolderAbsDir);

	const funcToRecordProcessedTsCode = processUserCode(
		testableFunction,
		sourceFolderAbsPath,
		recorderFileAbsPath,
		libsFolderAbsPath,
		tsConfigJsonFileAbsPath!,
	);

	const jsCodeToRun = createCodeToRun(
		testableFunction,
		testSuiteData,
		recorderSaverServiceFileAbsPath,
		funcToRecordProcessedTsCode,
		compilerOptions,
	);

	const recStorageData = await runCodeInExternalProcesssWithEval(
		languageId,
		sourceFileFolderAbsDir,
		jsCodeToRun,
		moduleType,
		tsConfigJsonFileAbsPath,
	);

	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			makeFileToTempFolder(
				'recordings.json',
				JSON.stringify(recStorageData, null, 2),
			);
		}
	}
	return recStorageData;
}

async function getSrcFolderPath(
	testableFunction: TestableFunction,
): Promise<string> {
	const closestPackageJson = await findUp('package.json', {
		cwd: testableFunction.sourceFilePath,
	});
	if (closestPackageJson === undefined) {
		throw new Error(
			`Could not find the closest package.json file to path ${testableFunction.sourceFilePath}`,
		);
	}
	const closestPackageJsonFolder = parse(closestPackageJson).dir;

	const srcFolder = join(
		closestPackageJsonFolder,
		configuration.get('general.sourceFolder'),
	);

	// TODO: Do we need the normalizeJoin here below?
	const sourceFolderAbsPath = normalizeJoin(srcFolder);

	return sourceFolderAbsPath;
}

function processUserCode(
	testableFunction: TestableFunction,
	sourceFolderAbsPath: string,
	recorderFileAbsPath: string,
	libsFolderAbsPath: string,
	tsConfigJsonFileAbsPath: string,
): string {
	const include = '**/*.ts';
	const exclude = undefined;

	// Pre process the code of the function to be recorded
	// and get the preprocessed code as string
	const codeProcessorConfig: CodeProcessorConfig = {
		sourceFolderAbsPath: sourceFolderAbsPath,
		recorderFileAbsPath: recorderFileAbsPath,
		libsFolderAbsPath: libsFolderAbsPath,
		tsConfigAbsPath: tsConfigJsonFileAbsPath,
		include: include,
		exclude: exclude,
	};

	const codeProcessor = new CodeProcessor(
		codeProcessorConfig,
		Logger,
		testableFunction.name,
		testableFunction.sourceFilePath,
	);

	const funcToRecordProcessedTsCode = codeProcessor.processCode();

	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			makeFileToTempFolder('processedTsCode.ts', funcToRecordProcessedTsCode);
		}
	}

	return funcToRecordProcessedTsCode;
}

/**
 * Return relative paths to recorder libraries as absolute paths might have problems in Windows
 *
 * @param sourceFilePath
 * @returns
 */
function getLibraryPaths(sourceFilePath: string): {
	recorderFileAbsPath: string;
	recorderSaverServiceFileAbsPath: string;
	libsFolderAbsPath: string;
} {
	const extensionAbsPath = getExtensionAbsPath();

	// const recorderFileAbsPath = normalizeJoin(
	// 	extensionAbsPath,
	// 	'dist',
	// 	'recorder',
	// 	'recorder',
	// ).replace('.js', '');
	// const recorderFileAbsPath =
	// 	'file://' + normalizeJoin(extensionAbsPath, 'dist', 'recorder', 'recorder');
	const recorderFileAbsPath = normalizeJoin(
		relative(
			sourceFilePath,
			join(extensionAbsPath, 'dist', 'recorder', 'recorder'),
		),
	); //.replace('.js', '');

	// const recorderSaverServiceFileAbsPath = normalizeJoin(
	// 	extensionAbsPath,
	// 	'dist',
	// 	'recorder',
	// 	'RecordSaverService',
	// ).replace('.js', '');
	// const recorderSaverServiceFileAbsPath =
	// 	'file://' +
	// 	normalizeJoin(extensionAbsPath, 'dist', 'recorder', 'RecordSaverService');
	const recorderSaverServiceFileAbsPath = normalizeJoin(
		relative(
			sourceFilePath,
			join(extensionAbsPath, 'dist', 'recorder', 'RecordSaverService'),
		),
	); //.replace('.js', '');

	const libsFolderAbsPath = normalizeJoin(extensionAbsPath, 'dist', 'libs');

	return {
		recorderFileAbsPath,
		recorderSaverServiceFileAbsPath,
		libsFolderAbsPath,
	};
}

function createCodeToRun(
	testableFunction: TestableFunction,
	testSuiteData: TestSuiteData,
	recorderSaverServiceFileAbsPath: string,
	funcToRecordProcessedTsCode: string,
	compilerOptions: CompilerOptions,
): string {
	const socketPort = configuration.get(
		'typescriptRunOptions.socketPort',
		undefined,
		7123,
	);

	let includeConsoleLogsInInvokingCode = false;
	if (PRODUCTION === false) {
		includeConsoleLogsInInvokingCode = false;
	}

	// Create code to invoke the preprocessed function
	// and get the invoking code as string
	const invokingTsCode = createCodeToRunAndRecordFunction(
		testableFunction,
		testSuiteData,
		{
			importName: 'RecordSaverService',
			importPath: recorderSaverServiceFileAbsPath,
		},
		socketPort,
		includeConsoleLogsInInvokingCode,
	);

	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			makeFileToTempFolder('invokingTsCode.ts', invokingTsCode);
		}
	}

	const tsCodeToRun = `${funcToRecordProcessedTsCode}\n${invokingTsCode}`;

	let jsCodeToRun = transpileToJs(tsCodeToRun, compilerOptions);

	// Webpack's Define plugin removes the if around the obfuscateJsCode in production mode.
	if (PRODUCTION === true) {
		jsCodeToRun = obfuscateJsCode(jsCodeToRun);
	}

	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		if (Container.instance.context.extensionMode !== ExtensionMode.Test) {
			makeFileToTempFolder('jsCodeToRun.js', jsCodeToRun);
		}
	}

	return jsCodeToRun;
}
