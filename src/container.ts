import { Event, EventEmitter, ExtensionContext, extensions } from 'vscode';
import { CodeLensController } from './codeLens/codeLensController';
import { Config, configuration } from './configuration';
import { Logger } from './logger';
import { Storage } from './storage';
import { TelemetryModule } from './TelemetryModule';

// import { ManageUnitTestsWebview } from './webviews/manageUnitTestsWebview';
// import { WebviewController } from './webviews/webviewController';

export class Container {
	public readonly context: ExtensionContext;
	public readonly codeLensController: CodeLensController;
	public readonly telemetryModule: TelemetryModule;
	// public readonly manageUnitTestsWebview: ManageUnitTestsWebview;

	public readonly config: Config;

	private _ready: boolean = false;
	private static _instance: Container | undefined;
	static get instance(): Container {
		if (Container._instance === undefined) {
			const message = 'No container instance available';
			const error = new Error(message);
			Logger.error(error, message);
			throw error;
		}
		return Container._instance;
	}

	static create(context: ExtensionContext, _cfg: Config): Container {
		if (Container._instance != null) {
			const message = 'Container is already initialized';
			const error = new Error(message);
			Logger.error(error, message);
			throw error;
		}

		Container._instance = new Container(context);
		return Container.instance;
	}

	private _onReady: EventEmitter<void> = new EventEmitter<void>();
	get onReady(): Event<void> {
		return this._onReady.event;
	}

	private readonly _storage: Storage;
	get storage(): Storage {
		return this._storage;
	}

	private constructor(context: ExtensionContext) {
		this.context = context;
		this.config = configuration.get();

		context.subscriptions.push((this._storage = new Storage(this.context)));

		context.subscriptions.push(
			(this.codeLensController = new CodeLensController(this)),
		);

		context.subscriptions.push(
			(this.telemetryModule = new TelemetryModule(this)),
		);
		this.telemetryModule.sendTelemetryEvent('ExtensionStarted');

		// context.subscriptions.push(
		// 	(this.manageUnitTestsWebview = new ManageUnitTestsWebview(this)),
		// );
	}

	public ready() {
		if (this._ready) throw new Error('Container is already ready');

		this._ready = true;
		queueMicrotask(() => {
			this._onReady.fire();
		});
	}
}
