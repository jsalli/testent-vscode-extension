import { RecordingStorageDataJSON } from '@testent/shared-recording';
import { configuration } from '../../../configuration';
import { CommonJSModule, ESModule } from '../../../constants';
import { Logger } from '../../../logger';
import { createProcess } from './shared/createProcess';
import { jsTsProcessRunOptionsCreator } from './shared/jsTsProcessRunOptionsCreator';
import { watchRecordingProcessProgress } from './shared/watchRecordingProcessProgress';
import { SocketServer } from './SocketServer';

export async function runCodeInExternalProcesssWithEval(
	languageId: 'javascript' | 'typescript',
	sourceFileDirAbsPath: string,
	code: string,
	moduleType: typeof CommonJSModule | typeof ESModule,
	tsConfigJsonFileAbsPath?: string,
): Promise<RecordingStorageDataJSON[]> {
	const processRunOptions = jsTsProcessRunOptionsCreator({
		languageId,
		sourceFileFolderPath: sourceFileDirAbsPath,
		code,
		moduleType,
		tsConfigJsonFileAbsPath,
	});
	// Webpack's Define plugin removes this code in production mode.
	if (PRODUCTION === false) {
		// logger.debug(
		// 	`Starting child process. Environmental variables:\n${JSON.stringify(
		// 		command.envVars,
		// 		null,
		// 		2,
		// 	)}`,
		// );
		Logger.debug(
			`Starting child process. Running command executing command:\n${processRunOptions.commandLine}`,
		);
	}

	const socketPort = configuration.get(
		'typescriptRunOptions.socketPort',
		undefined,
		7123,
	);
	const socketServer = new SocketServer(socketPort, Logger);

	try {
		const subProcess = createProcess(processRunOptions);
		await watchRecordingProcessProgress(subProcess);
		const records = socketServer.getRecords();
		return records;
	} catch (error) {
		const message = `Error running:\nexecutable: ${processRunOptions.commandLine}}\n`;
		Logger.error(error, message);
		throw error;
	} finally {
		socketServer.stop();
	}
}
