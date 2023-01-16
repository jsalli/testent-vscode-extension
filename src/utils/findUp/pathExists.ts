// Copy of https://github.com/sindresorhus/path-exists/blob/main/index.js.
// Importing packages with "node:"-prefix breaks the Webpack generated bundle.
// This is a version where the "node:xxx" has been replaced with just importing "xxx"

import fs, { promises as fsPromises } from 'fs';

export async function pathExists(path) {
	try {
		await fsPromises.access(path);
		return true;
	} catch {
		return false;
	}
}

export function pathExistsSync(path) {
	try {
		fs.accessSync(path);
		return true;
	} catch {
		return false;
	}
}
