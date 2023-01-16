import { configuration } from '../../../../configuration';
import { CommonJSModule, ESModule } from '../../../../constants';
import {
	detectOs,
	LinuxOS,
	MacOS,
	UnSupportedOsError,
	WindowsOS,
} from '../../../../utils/systemDetector';
import {
	CommandLineVariables,
	getCommandEnvVars,
	getCommandLineEnvVarGetter,
	getTerminalShell,
} from './commandCreatorUtils';
import { ProcessRunOptions } from './createProcess';
import { getTsNodeInstallationRelPath } from './getTsNodeInstallationRelPath';

export function jsTsProcessRunOptionsCreator({
	languageId,
	sourceFileFolderPath,
	code,
	moduleType,
	tsConfigJsonFileAbsPath,
	debugProcess,
}: {
	languageId: 'javascript' | 'typescript';
	sourceFileFolderPath: string;
	code?: string;
	moduleType: typeof CommonJSModule | typeof ESModule;
	tsConfigJsonFileAbsPath?: string;
	debugProcess?: boolean;
}): ProcessRunOptions {
	const commonPreExecutable = configuration.get(
		`${languageId}RunOptions.commonPreExecutable`,
		undefined,
		undefined,
	);

	let commandLineVariables: CommandLineVariables | undefined;
	if (languageId === 'typescript') {
		const tsNodeInstallationRelPath =
			getTsNodeInstallationRelPath(sourceFileFolderPath);
		commandLineVariables = {
			sourceFileDirAbsPath: sourceFileFolderPath,
			tsConfigJsonFileAbsPath: tsConfigJsonFileAbsPath,
			tsNodeInstallationPath: tsNodeInstallationRelPath,
		};
	}

	const baseExecutable = 'node';
	const envVars = getCommandEnvVars({
		languageId,
		moduleType,
		code,
		commandLineVariables,
	});

	if (debugProcess) {
		envVars[
			'NODE_OPTIONS'
		] = `--inspect-brk=127.0.0.1:9234 ${envVars['NODE_OPTIONS']}`;
	}

	const cmdLineEnvVarGetter = getCommandLineEnvVarGetter();
	const osType = detectOs();
	let executable: string;
	if (osType === WindowsOS) {
		executable = `${cmdLineEnvVarGetter} | ${baseExecutable}`;
	} else if (osType === LinuxOS || osType === MacOS) {
		executable = `echo ${cmdLineEnvVarGetter} | ${baseExecutable}`;
	} else {
		throw new UnSupportedOsError();
	}

	const shell = getTerminalShell();

	const preExecutable =
		commonPreExecutable && commonPreExecutable.length > 0
			? commonPreExecutable
			: undefined;

	const commandLine = `${
		preExecutable ? `${preExecutable} && ` : ''
	}${executable}`;

	// Fix a bug by passing the "--experimental-specifier-resolution=node" option also to the command line args.
	// Without this the debugging will break as node does not find imports without file name
	// import {myFunc} from './myFolder/myFile'; <-- Will break without the "--experimental-specifier-resolution=node" in args
	// Even thought the flag is in NODE_OPTIONS env var. No idea why.
	const args =
		moduleType === ESModule ? ['--experimental-specifier-resolution=node'] : [];

	return {
		cwd: sourceFileFolderPath,
		commandLine,
		args: args,
		envVars: envVars,
		shell: shell,
	};
}
