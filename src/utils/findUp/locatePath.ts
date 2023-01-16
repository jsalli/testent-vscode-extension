// Copy of https://github.com/sindresorhus/locate-path/blob/main/index.js
// Importing packages with "node:"-prefix breaks the Webpack generated bundle.
// This is a version where the "node:xxx" has been replaced with just importing "xxx"
import { promises as fsPromises } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import pLocate from 'p-locate';

export interface Options {
	/**
	The current working directory.
	@default process.cwd()
	*/
	readonly cwd?: URL | string;

	/**
	The type of path to match.
	@default 'file'
	*/
	readonly type?: 'file' | 'directory';

	/**
	Allow symbolic links to match if they point to the requested path type.
	@default true
	*/
	readonly allowSymlinks?: boolean;
}

export interface AsyncOptions extends Options {
	/**
	The number of concurrently pending promises.
	Minimum: `1`
	@default Infinity
	*/
	readonly concurrency?: number;

	/**
	Preserve `paths` order when searching.
	Disable this to improve performance if you don't care about the order.
	@default true
	*/
	readonly preserveOrder?: boolean;
}

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile',
};

function checkType(type) {
	if (Object.hasOwnProperty.call(typeMappings, type)) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => stat[typeMappings[type]]();

const toPath = (urlOrPath) =>
	urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

export function locatePath(
	paths: Iterable<string>,
	{
		cwd = process.cwd(),
		type = 'file',
		allowSymlinks = true,
		concurrency,
		preserveOrder,
	}: AsyncOptions,
) {
	checkType(type);
	cwd = toPath(cwd);

	const statFunction = allowSymlinks ? fsPromises.stat : fsPromises.lstat;

	return pLocate(
		paths,
		async (pathItem) => {
			try {
				const stat = await statFunction(path.resolve(cwd as string, pathItem));
				return matchType(type, stat);
			} catch {
				return false;
			}
		},
		{ concurrency, preserveOrder },
	);
}

// export function locatePathSync(
// 	paths,
// 	{ cwd = process.cwd(), type = 'file', allowSymlinks = true } = {},
// ) {
// 	checkType(type);
// 	cwd = toPath(cwd);

// 	const statFunction = allowSymlinks ? fs.statSync : fs.lstatSync;

// 	for (const path_ of paths) {
// 		try {
// 			const stat = statFunction(path.resolve(cwd, path_));

// 			if (matchType(type, stat)) {
// 				return path_;
// 			}
// 		} catch {}
// 	}
// }
