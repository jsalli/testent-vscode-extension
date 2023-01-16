import { parse } from 'path';
import { parseTsConfigJson } from '@testent/code-preprocessor';
import { normalizeJoin } from '@testent/shared';
import { CompilerOptions } from 'typescript';
import { configuration } from '../../../../configuration';
import { findUp } from '../../../../utils/findUp/findUp';

export async function getClosestTsconfig(sourceFilePath: string): Promise<{
	compilerOptions: CompilerOptions;
	tsConfigJsonFileAbsPath: string;
}> {
	const closestPackageJson = await findUp('package.json', {
		cwd: sourceFilePath,
	});
	if (closestPackageJson === undefined) {
		throw new Error(
			`Could not find the closest package.json file to path ${sourceFilePath}`,
		);
	}

	const closestPackageJsonFolder = parse(closestPackageJson).dir;

	const tsConfigJsonFileAbsPath = normalizeJoin(
		closestPackageJsonFolder,
		configuration.get(
			'typescriptRunOptions.tsconfigRelPath',
			undefined,
			'./tsconfig.json',
		),
	);
	const compilerOptions = parseTsConfigJson(tsConfigJsonFileAbsPath);
	return { compilerOptions, tsConfigJsonFileAbsPath };
}
