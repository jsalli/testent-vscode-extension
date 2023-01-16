import { CompilerOptions, ModuleKind, ScriptTarget } from 'typescript';
import { CommonJSModule, ESModule } from '../../../../constants';
import { getClosestTsconfig } from './getClosestTsconfig';

export async function detectTsModuleOptions(sourceFilePath: string): Promise<{
	moduleType: typeof CommonJSModule | typeof ESModule;
	compilerOptions: CompilerOptions;
	tsConfigJsonFileAbsPath: string;
}> {
	const { compilerOptions, tsConfigJsonFileAbsPath } = await getClosestTsconfig(
		sourceFilePath,
	);

	let moduleType: typeof CommonJSModule | typeof ESModule;
	// Done according to https://www.typescriptlang.org/tsconfig#module
	if (compilerOptions.module === undefined) {
		if (
			compilerOptions.target === undefined ||
			compilerOptions.target === ScriptTarget.ES3 ||
			compilerOptions.target === ScriptTarget.ES5
		) {
			moduleType = CommonJSModule;
		} else {
			moduleType = ESModule;
		}
	} else if (compilerOptions.module === ModuleKind.CommonJS) {
		moduleType = CommonJSModule;
	} else if (
		compilerOptions.module === ModuleKind.ES2015 ||
		compilerOptions.module === ModuleKind.ES2020 ||
		compilerOptions.module === ModuleKind.ES2022 ||
		compilerOptions.module === ModuleKind.ESNext
	) {
		moduleType = ESModule;
	} else {
		throw new Error(
			`Unsupported Typescript module kind in tsconfig. Got ${
				ModuleKind[compilerOptions.module]
			}`,
		);
	}

	compilerOptions.sourceMap = false;

	return {
		moduleType,
		compilerOptions,
		tsConfigJsonFileAbsPath,
	};
}
