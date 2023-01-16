import net, { Server } from 'net';
import { decrypt } from '@testent/shared';
import { RecordingStorageDataJSON } from '@testent/shared-recording';
import { Logger } from '../../../logger';

export class SocketServer {
	private server: Server;
	private records: string[] | undefined;

	constructor(socketPort: number, private logger: typeof Logger) {
		this.server = net.createServer((client) => {
			client.on('data', (data) => {
				this.saveData(data.toString());
			});
		});

		this.server.listen(socketPort, () => {
			// Webpack's Define plugin removes this code in production mode.
			if (PRODUCTION === false) {
				this.logger.debug(
					`Local Record Socket Server started at port ${socketPort}`,
				);
			}
		});
	}

	public stop() {
		this.server.close();
	}

	public getRecords(): RecordingStorageDataJSON[] {
		if (this.records == null) {
			throw new Error(
				`No records received from socket client. Got value of type ${typeof this
					.records} instead of an array`,
			);
		} else if (Array.isArray(this.records) && this.records.length < 1) {
			throw new Error(
				`No records received from socket client. Got an empty array`,
			);
		}
		const decryptedRecordsArray = this.records.map((rec) => {
			const decryptedJsonString = decrypt(rec);
			return JSON.parse(decryptedJsonString) as RecordingStorageDataJSON;
		});
		return decryptedRecordsArray;
	}

	private saveData(data: string) {
		try {
			const encryptedDataArray = JSON.parse(data) as string[];
			this.records = encryptedDataArray;
		} catch (error) {
			this.logger.debug(error);
		}
	}
}
