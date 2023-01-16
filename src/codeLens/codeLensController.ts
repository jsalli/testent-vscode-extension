import { ConfigurationChangeEvent, Disposable, languages } from 'vscode';
import { configuration } from '../configuration';
import { Container } from '../container';
import { Logger } from '../logger';
import { RunInputViewCodeLensProvider } from './runInputViewCodeLensProvider';
import { SourceViewCodeLensProvider } from './sourceViewCodeLensProvider';
import { TestInputViewCodeLensProvider } from './testInputViewCodeLensProvider';

export class CodeLensController implements Disposable {
	private _disposable: Disposable | undefined;
	private _sourceViewCodeLensProviders: SourceViewCodeLensProvider | undefined;
	private _testInputViewCodeLensProvider:
		| TestInputViewCodeLensProvider
		| undefined;
	private _runInputViewCodeLensProvider:
		| RunInputViewCodeLensProvider
		| undefined;
	private _providerDisposable: Disposable | undefined;

	constructor(private container: Container) {
		this._disposable = Disposable.from(
			container.onReady(this.onReady, this),
			configuration.onDidChange(this.onConfigurationChanged, this),
		);
	}

	dispose() {
		this._providerDisposable?.dispose();
		this._disposable?.dispose();
	}

	private onReady(): void {
		this.onConfigurationChanged();
	}

	private onConfigurationChanged(e?: ConfigurationChangeEvent) {
		if (!configuration.changed(e, 'codeLens')) {
			return;
		}
		if (e != null) {
			Logger.log('CodeLens config changed; resetting CodeLens provider');
		}

		const cfg = this.container.config.codeLens;
		if (cfg.enabled === true) {
			this.ensureProviders();
		} else {
			this._providerDisposable?.dispose();
			this._sourceViewCodeLensProviders = undefined;
			this._testInputViewCodeLensProvider = undefined;
			this._runInputViewCodeLensProvider = undefined;
		}
	}

	private ensureProviders() {
		if (
			this._sourceViewCodeLensProviders !== undefined &&
			this._testInputViewCodeLensProvider !== undefined &&
			this._runInputViewCodeLensProvider !== undefined
		) {
			this._sourceViewCodeLensProviders.reset();
			this._testInputViewCodeLensProvider.reset();
			this._runInputViewCodeLensProvider.reset();
			return;
		}

		this._providerDisposable?.dispose();

		this._sourceViewCodeLensProviders = new SourceViewCodeLensProvider(
			this.container,
		);
		this._testInputViewCodeLensProvider = new TestInputViewCodeLensProvider(
			this.container,
		);
		this._runInputViewCodeLensProvider = new RunInputViewCodeLensProvider(
			this.container,
		);

		this._providerDisposable = Disposable.from(
			languages.registerCodeLensProvider(
				SourceViewCodeLensProvider.selector,
				this._sourceViewCodeLensProviders,
			),
			languages.registerCodeLensProvider(
				TestInputViewCodeLensProvider.selector,
				this._testInputViewCodeLensProvider,
			),
			languages.registerCodeLensProvider(
				RunInputViewCodeLensProvider.selector,
				this._runInputViewCodeLensProvider,
			),
		);
	}
}
