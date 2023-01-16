// Copy of https://github.com/sindresorhus/find-up/blob/main/index.js
// Importing packages with "node:"-prefix breaks the Webpack generated bundle.
// This is a version where the "node:xxx" has been replaced with just importing "xxx"

import path from 'path';
import { fileURLToPath } from 'url';
import { locatePath, Options as LocatePathOptions } from './locatePath';

export type Match = string | typeof findUpStop | undefined;

export interface Options extends LocatePathOptions {
	/**
	The path to the directory to stop the search before reaching root if there were no matches before the `stopAt` directory.
	@default path.parse(cwd).root
	*/
	readonly stopAt?: string;

	limit?: number;
}

const toPath = (urlOrPath) =>
	urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

export const findUpStop: unique symbol = Symbol('findUpStop');

export async function findUpMultiple(
	name: string | readonly string[],
	options?: Options,
) {
	let directory = path.resolve(toPath(options?.cwd) || '');
	const { root } = path.parse(directory);
	const stopAt = path.resolve(directory, options?.stopAt || root);
	const limit = options?.limit || Number.POSITIVE_INFINITY;
	const paths = [name].flat();

	const runMatcher = async (locateOptions) => {
		if (typeof name !== 'function') {
			return locatePath(paths, locateOptions);
		}

		const foundPath = await (name as any)(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath([foundPath], locateOptions);
		}

		return foundPath;
	};

	const matches: any[] = [];

	while (true) {
		const foundPath = await runMatcher({ ...options, cwd: directory });

		if (foundPath === findUpStop) {
			break;
		}

		if (foundPath) {
			matches.push(path.resolve(directory, foundPath));
		}

		if (directory === stopAt || matches.length >= limit) {
			break;
		}

		directory = path.dirname(directory);
	}

	return matches;
}

// export function findUpMultipleSync(name, options = {}) {
// 	let directory = path.resolve(toPath(options.cwd) || '');
// 	const { root } = path.parse(directory);
// 	const stopAt = options.stopAt || root;
// 	const limit = options.limit || Number.POSITIVE_INFINITY;
// 	const paths = [name].flat();

// 	const runMatcher = (locateOptions) => {
// 		if (typeof name !== 'function') {
// 			return locatePathSync(paths, locateOptions);
// 		}

// 		const foundPath = name(locateOptions.cwd);
// 		if (typeof foundPath === 'string') {
// 			return locatePathSync([foundPath], locateOptions);
// 		}

// 		return foundPath;
// 	};

// 	const matches = [];

// 	while (true) {
// 		const foundPath = runMatcher({ ...options, cwd: directory });

// 		if (foundPath === findUpStop) {
// 			break;
// 		}

// 		if (foundPath) {
// 			matches.push(path.resolve(directory, foundPath));
// 		}

// 		if (directory === stopAt || matches.length >= limit) {
// 			break;
// 		}

// 		directory = path.dirname(directory);
// 	}

// 	return matches;
// }

export async function findUp(
	name: string | readonly string[],
	options?: Options,
): Promise<string | undefined> {
	const matches = await findUpMultiple(name, { ...options, limit: 1 });
	return matches[0];
}

// export function findUpSync(name, options = {}) {
// 	const matches = findUpMultipleSync(name, { ...options, limit: 1 });
// 	return matches[0];
// }
