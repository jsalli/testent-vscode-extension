//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @typedef {import('webpack').NormalModule} NormalModule **/

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const { readFileSync } = require('fs');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const esbuild = require('esbuild');
const JSON5 = require('json5');
const { WebpackError, DefinePlugin } = require('webpack');
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackObfuscator = require('webpack-obfuscator');

const obfuscatorOptions = {
	compact: true,
	controlFlowFlattening: false,
	deadCodeInjection: true,
	deadCodeInjectionThreshold: 0.4,
	debugProtection: true,
	debugProtectionInterval: 0,
	disableConsoleOutput: true,
	identifierNamesGenerator: 'hexadecimal',
	log: false,
	numbersToExpressions: true,
	renameGlobals: false,
	selfDefending: false,
	simplify: true,
	splitStrings: true,
	stringArray: true,
	stringArrayCallsTransform: true,
	stringArrayEncoding: ['base64'],
	stringArrayIndexShift: true,
	stringArrayRotate: true,
	stringArrayShuffle: true,
	stringArrayWrappersCount: 2,
	stringArrayWrappersChainedCalls: true,
	stringArrayWrappersParametersMaxCount: 4,
	stringArrayWrappersType: 'function',
	stringArrayThreshold: 0.75,
	unicodeEscapeSequence: false,
};

const verdorChunkName = 'verdor';

const appinsightsKeyDevelopment =
	'InstrumentationKey=a26d01a0-3b0c-4ed2-94a5-80c4548eb39d;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/';
const appinsightsKeyProduction =
	'InstrumentationKey=f957512e-0cd6-49c8-9e26-797dabb2cdb1;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/';

module.exports =
	/**
	 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; useEsbuild?: boolean; obfuscate?: boolean; childProcessBreakpoints?: boolean } | undefined } env
	 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
	 * @returns { WebpackConfig[] }
	 */
	function (env, argv) {
		const mode = argv.mode || 'none';

		env = {
			analyzeBundle: false,
			analyzeDeps: false,
			useEsbuild: false,
			obfuscate: false,
			childProcessBreakpoints: false,
			...env,
		};

		return [
			getExtensionConfig('node', mode, env),
			// getExtensionConfig('webworker', mode, env),
			// getWebviewsConfig(mode, env),
		];
	};

/**
 * @param { 'node' | 'webworker' } target
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; useEsbuild?: boolean; obfuscate?: boolean; childProcessBreakpoints?: boolean }} env
 * @returns { WebpackConfig }
 */
function getExtensionConfig(target, mode, env) {
	/**
	 * @type WebpackConfig['plugins'] | any
	 */
	const plugins = [
		new DefinePlugin({
			PRODUCTION: JSON.stringify(mode === 'production'),
			CHILDPROCESSBREAKPOINTS: env.childProcessBreakpoints === true,
			APPINSIGHTSKEY: JSON.stringify(
				mode === 'production'
					? appinsightsKeyProduction
					: appinsightsKeyDevelopment,
			),
		}),
		new CopyPlugin({
			patterns: [
				// Copy Typescript definition libs
				{
					from: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'node_modules',
						'typescript',
						'lib',
						'*.d.ts',
					),
					to: path.posix.join(__dirname.replace(/\\/g, '/'), 'dist', 'libs'),
					context: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'node_modules',
						'typescript',
						'lib',
					),
				},
				// Copy the recorder package to the vscode extension package
				{
					from: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'..',
						'recorder',
						'dist',
					),
					to: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'dist',
						'recorder',
					),
				},
				// Copy the record saver package to the vscode extension package
				{
					from: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'..',
						'record-globalvar-saver',
						'dist',
					),
					to: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'dist',
						'recorder',
					),
				},
				// Copy our own version of TS-Node to the vscode extension package
				{
					from: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'..',
						'buildTools',
						'ts-node-stripper',
						'out',
						'ts-node-installation',
					),
					to: path.posix.join(
						__dirname.replace(/\\/g, '/'),
						'dist',
						'ts-node-installation',
					),
				},
			],
		}),
	];

	if (env.obfuscate) {
		plugins.unshift(
			new WebpackObfuscator(obfuscatorOptions, [`*${verdorChunkName}*`]),
		);
	}

	if (env.analyzeDeps) {
		plugins.push(
			new CircularDependencyPlugin({
				cwd: __dirname,
				exclude: /node_modules/,
				failOnError: false,
				onDetected: function ({
					module: _webpackModuleRecord,
					paths,
					compilation,
				}) {
					if (paths.some((p) => p.includes('container.ts'))) return;

					// @ts-ignore
					compilation.warnings.push(new WebpackError(paths.join(' -> ')));
				},
			}),
		);
	}

	if (mode !== 'production' && env.analyzeBundle) {
		plugins.push(new BundleAnalyzerPlugin());
	} else if (mode === 'production') {
		const packageJsonFile = readFileSync('./package.json', {
			encoding: 'utf-8',
		});
		const packageJson = JSON.parse(packageJsonFile);
		const extensionVersion = packageJson.version;
		plugins.push(
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				openAnalyzer: false,
				reportFilename: path.join(
					'..',
					'publish',
					`VSCode_extension_production_bundle_report_${extensionVersion}.html`,
				),
			}),
		);
	}

	return {
		name: `extension:${target}`,
		entry: {
			testent: './src/extension.ts',
		},
		mode: mode,
		target: target,
		devtool: mode === 'production' ? false : 'source-map',
		output: {
			path:
				target === 'webworker'
					? path.join(__dirname, 'dist', 'browser')
					: path.join(__dirname, 'dist'),
			libraryTarget: 'commonjs2',
			// filename: 'testent.js',
			// chunkFilename: 'feature-[name].js',
			filename: '[name].js',
			chunkFilename: '[id].[chunkhash].js',
		},
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendorChunk: {
						test(
							/**
							 * @type NormalModule
							 */ module,
						) {
							// Don't include the javascript-obfuscator-package in the un-obfuscated vendor package
							// so that the obfuscation of dynamic code would be easy to disable
							if (
								module.resource &&
								module.resource.includes('javascript-obfuscator')
							) {
								return false;
							} else if (
								module.resource &&
								module.resource.match(/[\\/]node_modules[\\/]/)
							) {
								return true;
							}
							return false;
						},
						name: verdorChunkName,
						chunks: 'all',
					},
				},
			},
		},
		externals: {
			vscode: 'commonjs vscode',
			// applicationinsights-native-metrics is not present for @vscode/extension-telemetry.
			// Without this line a warning is given when bundling the VSCode extension
			// https://github.com/microsoft/vscode-extension-telemetry/issues/41
			'applicationinsights-native-metrics':
				'commonjs applicationinsights-native-metrics',
		},
		module: {
			rules: [
				{
					exclude: /\.d\.ts$/,
					include: [path.join(__dirname, '..')],
					test: /\.tsx?$/,
					use: env.useEsbuild
						? {
								loader: 'esbuild-loader',
								options: {
									implementation: esbuild,
									loader: 'ts',
									target: ['ES2021'],
									tsconfigRaw: resolveTSConfig(
										path.join(
											__dirname,
											target === 'webworker'
												? 'tsconfig.browser.json'
												: 'tsconfig.json',
										),
									),
								},
						  }
						: {
								loader: 'ts-loader',
								options: {
									configFile: path.join(
										__dirname,
										target === 'webworker'
											? 'tsconfig.browser.json'
											: 'tsconfig.json',
									),
									experimentalWatchApi: true,
									transpileOnly: true,
								},
						  },
				},
			],
			// https://github.com/microsoft/TypeScript/issues/39436
			noParse: [require.resolve('typescript/lib/typescript.js')],
		},
		resolve: {
			alias: {
				'@env': path.resolve(
					__dirname,
					'src',
					'env',
					target === 'webworker' ? 'browser' : target,
				),
			},
			fallback:
				target === 'webworker'
					? {
							child_process: false,
							crypto: require.resolve('crypto-browserify'),
							fs: false,
							os: false,
							path: require.resolve('path-browserify'),
							process: false,
							stream: false,
							url: false,
					  }
					: undefined,
			mainFields:
				target === 'webworker'
					? ['browser', 'module', 'main']
					: ['module', 'main'],
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
		},
		plugins: plugins,
		stats: {
			preset: 'errors-warnings',
			assets: true,
			colors: true,
			env: true,
			errorsCount: true,
			warningsCount: true,
			timings: true,
		},
	};
}

/**
 * @param { string } configFile
 * @returns { string }
 */
function resolveTSConfig(configFile) {
	const result = spawnSync('npx', ['tsc', `-p ${configFile}`, '--showConfig'], {
		cwd: __dirname,
		encoding: 'utf8',
		shell: true,
	});

	const data = result.stdout;
	const start = data.indexOf('{');
	const end = data.lastIndexOf('}') + 1;
	// const myData = data.substring(start, end);
	// console.log(`==Start=\n${myData}\n===END===`);
	const json = JSON5.parse(data.substring(start, end));
	return json;
}
