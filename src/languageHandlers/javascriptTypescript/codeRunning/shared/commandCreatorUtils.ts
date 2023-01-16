import { configuration } from '../../../../configuration';
import {
	codeToRunEnvVarName,
	CommonJSModule,
	ESModule,
} from '../../../../constants';
import {
	detectOs,
	LinuxOS,
	MacOS,
	UnSupportedOsError,
	WindowsCommandPromptNotSupportedError,
	WindowsOS,
} from '../../../../utils/systemDetector';

export interface CommandLineVariables {
	sourceFileDirAbsPath: string;
	tsConfigJsonFileAbsPath?: string;
	tsNodeInstallationPath?: string;
}

export function getTerminalShell(): string | true {
	const osType = detectOs();
	switch (osType) {
		case LinuxOS: {
			const shellPath = configuration.get(
				'terminalOptions.linuxTerminalExecutablePath',
			);
			return shellPath.length === 0 ? true : shellPath;
		}
		case WindowsOS: {
			const shellPath = configuration.get(
				'terminalOptions.windowsTerminalExecutablePath',
			);
			return shellPath.length === 0 ? true : shellPath;
		}
		case MacOS: {
			const shellPath = configuration.get(
				'terminalOptions.macTerminalExecutablePath',
			);
			return shellPath.length === 0 ? true : shellPath;
		}
		default:
			throw new UnSupportedOsError();
	}
}

export function getCommandLineEnvVarGetter(): string {
	const osType = detectOs();
	switch (osType) {
		case LinuxOS: {
			return `$${codeToRunEnvVarName}`;
		}
		case WindowsOS: {
			const winTermType = configuration.get(
				'terminalOptions.windowsTerminalType',
			);
			if (winTermType === 'powerShell') {
				return `$Env:${codeToRunEnvVarName}`;
			} else if (winTermType === 'bashKind') {
				return `$${codeToRunEnvVarName}`;
			}
			throw new WindowsCommandPromptNotSupportedError();
		}
		case MacOS: {
			return `$${codeToRunEnvVarName}`;
		}
		default:
			throw new UnSupportedOsError();
	}
}

/**
 * Replace {{myVariable}} kind of texts from the object values with corresponding variable values from given variables
 *
 * @param args
 * @param commandLineVariables
 * @returns
 */
function objectVariableReplacer(
	args: { [key: string]: string | undefined },
	commandLineVariables: CommandLineVariables,
): { [key: string]: string | undefined } {
	for (const argKey of Object.keys(args)) {
		for (const [key, value] of Object.entries(commandLineVariables)) {
			args[argKey] = args[argKey]?.replace(`{{${key}}}`, value);
		}
	}
	// TODO: Check if an variable was not replaced and a patter {{someVariable}} is still present

	return args;
}

export function getCommandEnvVars({
	languageId,
	moduleType,
	code,
	commandLineVariables,
}: {
	languageId: 'javascript' | 'typescript';
	moduleType: typeof CommonJSModule | typeof ESModule;
	code?: string;
	commandLineVariables?: CommandLineVariables;
}): { [key: string]: string | undefined } {
	const option:
		| 'javascriptRunOptions.envVarsWhenCommonJS'
		| 'javascriptRunOptions.envVarsWhenESModule'
		| 'typescriptRunOptions.envVarsWhenCommonJS'
		| 'typescriptRunOptions.envVarsWhenESModule' = `${languageId}RunOptions.envVarsWhen${moduleType}`;

	const moduleTypeDepEnvVars = configuration.get(option);
	// configuration.get gives a Proxy object which we need to de-proxify
	// so that for example Object.entries(myProxyObject) would work later on
	const moduleTypeDepEnvVarsDeProxyfied = { ...moduleTypeDepEnvVars };

	let envVars: { [key: string]: string | undefined };

	if (commandLineVariables != null) {
		envVars = objectVariableReplacer(
			moduleTypeDepEnvVarsDeProxyfied,
			commandLineVariables,
		);
	} else {
		envVars = moduleTypeDepEnvVarsDeProxyfied;
	}

	if (code !== undefined) {
		envVars[codeToRunEnvVarName] = code;
	}

	return envVars;
}
