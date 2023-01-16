import {
	CompilerOptions,
	ModuleKind,
	ModuleResolutionKind,
	ScriptTarget,
} from 'typescript';
import { CommonJSModule, ESModule } from '../../../../constants';
import { findUp } from '../../../../utils/findUp/findUp';
import { readFilePathASync } from '../../../../utils/fsUtils';

async function findClosestPackageJsonPath(
	sourceFilePath: string,
): Promise<string> {
	const closestPackageJsonPath = await findUp('package.json', {
		cwd: sourceFilePath,
	});
	if (closestPackageJsonPath === undefined) {
		throw new Error(
			`Could not find the closest package.json file to path ${sourceFilePath}`,
		);
	}
	return closestPackageJsonPath;
}

export async function detectJsModuleOptions(sourceFilePath: string): Promise<{
	moduleType: typeof CommonJSModule | typeof ESModule;
	compilerOptions: CompilerOptions;
}> {
	const closestPackageJsonPath = await findClosestPackageJsonPath(
		sourceFilePath,
	);
	const packageJsonRawContent = await readFilePathASync(closestPackageJsonPath);
	const packageJsonContent: { type?: string } = JSON.parse(
		packageJsonRawContent,
	);

	let moduleType: typeof CommonJSModule | typeof ESModule = CommonJSModule;
	if (packageJsonContent.type?.toLowerCase() === 'module') {
		moduleType = ESModule;
	}

	const compilerOptions = getDefaultJsCompilerOptions(moduleType);

	return { moduleType, compilerOptions };
}

function getDefaultJsCompilerOptions(
	moduleType: typeof CommonJSModule | typeof ESModule,
): CompilerOptions {
	const defaultCompilerOptions: CompilerOptions = {
		allowJs: true,
		target: ScriptTarget.ES2015,
		module:
			moduleType === CommonJSModule ? ModuleKind.CommonJS : ModuleKind.ES2015,
		lib: ['ES2015'],
		moduleResolution: ModuleResolutionKind.NodeNext,
		sourceMap: false,
	};

	return defaultCompilerOptions;
}
