export const publisherName = 'testent'; // Defined in package.json 'publisher'-field
export const extensionName = 'testent-vscode-extension'; // Defined in package.json 'name'-field
export const extensionDisplayName = 'testent'; // Defined in package.json 'displayName'-field
export const vscodeUniqueExtensionID = `${publisherName}.${extensionName}`;
export const extensionFolder = `.${extensionDisplayName.toLowerCase()}`;

export const terminalName = `${extensionName}-run-in-terminal`;

export const enum ContextKeys {
	ViewsManageTestsOneOpen = 'testent:views:tests:manage:one:open',
	ViewsManageTestsAllOpen = 'testent:views:tests:manage:all:open',
	ViewsInputsOpen = 'testent:views:inputs:open',
	ViewsInputsClose = 'testent:views:inputs:close',
	RunTestsForFunctionOne = 'testent:run:tests:forFunction:one',
	RunTestsForFunctionAll = 'testent:run:tests:forFunction:all',
	RunTestsAll = 'testent:run:tests:all',
}

export const enum DocumentSchemes {
	File = 'file',
	Untitled = 'untitled',
}

export const codeToRunEnvVarName = 'CODE_TO_RUN';

export const CommonJSModule = 'CommonJS';
export const ESModule = 'ESModule';
