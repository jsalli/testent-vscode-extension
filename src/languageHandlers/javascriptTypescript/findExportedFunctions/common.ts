import {
	BindingPatternNotSupportedError,
	CodePosition,
	ImportSpecifier,
	isNodeExported,
	TestableFunctionArgs,
	TypeNodeSpecifier,
} from '@testent/shared-code-processing';
import {
	BindingName,
	Expression,
	forEachChild,
	ImportClause,
	InterfaceDeclaration,
	isArrayBindingPattern,
	isIdentifier,
	isImportDeclaration,
	isInterfaceDeclaration,
	isNamedImports,
	isNamespaceImport,
	isObjectBindingPattern,
	isStringLiteral,
	isTypeAliasDeclaration,
	Node,
	NodeArray,
	ParameterDeclaration,
	SourceFile,
	SyntaxKind,
	TypeAliasDeclaration,
	TypeNode,
	VisitResult,
} from 'typescript';
import { TextDocument } from 'vscode';
import { Logger } from '../../../logger';
import { extractTypeNames } from '../utils/extractTypeNames';

export interface ExportAssignmentArrowFunc extends Omit<Node, 'expression'> {
	expression: any; // TODO: Fix typing of expression to be an ArrowFunction
}

// TODO: Get rid of the TextDocument dependency.
export function getCodePosition(
	document: TextDocument,
	startPos: number,
	endPos: number,
): CodePosition {
	const startLine = document.lineAt(document.positionAt(startPos).line);
	const endLine = document.lineAt(document.positionAt(endPos).line);

	const codePosition: CodePosition = {
		start: { line: startLine.lineNumber, character: 0 },
		end: { line: endLine.lineNumber, character: 0 },
	};
	return codePosition;
}

export function parseFunctionArguments(
	params: NodeArray<ParameterDeclaration>,
	sourceFile: SourceFile,
): TestableFunctionArgs[] {
	return params.map((param) => {
		const argName = getBindingName(param.name);
		const argOptional = param.questionToken?.kind === SyntaxKind.QuestionToken;
		const argType: TypeNodeSpecifier = {
			importSpecifiers: findTypeImports(param.type, sourceFile),
			typeAsString: param.type?.getFullText(sourceFile),
			typeNode: param.type,
		};
		return { name: argName, type: argType, optional: argOptional };
	});
}

export function parseReturn(
	typeNode: TypeNode | undefined,
	sourceFile: SourceFile,
): TypeNodeSpecifier {
	const returnValue: TypeNodeSpecifier = {
		importSpecifiers: findTypeImports(typeNode, sourceFile),
		typeAsString: typeNode?.getFullText(sourceFile),
		typeNode: typeNode,
	};
	return returnValue;
}

function findTypeImports(
	typeNode: TypeNode | undefined,
	sourceFile: SourceFile,
): ImportSpecifier[] | undefined {
	if (typeNode === undefined) {
		return undefined;
	}

	const typeNamesToFind = extractTypeNames(typeNode);
	if (typeNamesToFind.length === 0) {
		return undefined;
	}

	const importSpecifiers: ImportSpecifier[] = [];
	forEachChild(sourceFile, (node: Node): VisitResult<Node> => {
		if (isImportDeclaration(node) && node.importClause != null) {
			const newImps = handleImportDeclaration(
				node.importClause,
				typeNamesToFind,
				node.moduleSpecifier,
			);
			importSpecifiers.push(...newImps);
		} else if (isInterfaceDeclaration(node) && isNodeExported(node)) {
			const newImp = handleInterfaceDeclaration(node, typeNamesToFind);
			if (newImp != null) {
				importSpecifiers.push(newImp);
			}
		} else if (isTypeAliasDeclaration(node) && isNodeExported(node)) {
			const newImp = handleTypeAliasDeclaration(node, typeNamesToFind);
			if (newImp != null) {
				importSpecifiers.push(newImp);
			}
		}
		return undefined;
	});

	return importSpecifiers;
}

export function getBindingName(node: BindingName): string {
	if (isArrayBindingPattern(node) || isObjectBindingPattern(node)) {
		throw new BindingPatternNotSupportedError(node, '[1]');
	}

	return node.text;
}

function handleImportDeclaration(
	importClause: ImportClause,
	typeNamesToFind: string[],
	moduleSpecifier: Expression,
): ImportSpecifier[] {
	const importSpecifiers: ImportSpecifier[] = [];

	if (!isStringLiteral(moduleSpecifier)) {
		const message = `Module specifier is not of type "StringLiteral". Got: "${moduleSpecifier.kind}"`;
		const error = new Error(message);
		Logger.error(error, message);
		throw error;
	}
	const moduleSpecifierPath = moduleSpecifier.text;
	const defaultName = importClause.name;
	if (defaultName !== undefined && isIdentifier(defaultName)) {
		const foundTypeName = typeNamesToFind.find(
			(typeName) => typeName === defaultName.text,
		);
		if (foundTypeName) {
			importSpecifiers.push({
				importType: 'default',
				importPath: moduleSpecifierPath,
				importName: foundTypeName,
				importPropertyName: undefined,
			});
		}
	}

	const namedImports = importClause.namedBindings;
	if (namedImports != null && isNamespaceImport(namedImports)) {
		throw new Error('Namespace imports not supported yet');
	} else if (namedImports != null && isNamedImports(namedImports)) {
		for (const impSpec of namedImports.elements) {
			const foundTypeName = typeNamesToFind.find(
				(typeName) => typeName === impSpec.name.text,
			);
			if (foundTypeName) {
				importSpecifiers.push({
					importType: 'named',
					importPath: moduleSpecifierPath,
					importName: impSpec.name.text,
					importPropertyName:
						impSpec.propertyName !== undefined
							? impSpec.propertyName.text
							: undefined,
				});
			}
		}
	}
	return importSpecifiers;
}

function handleInterfaceDeclaration(
	node: InterfaceDeclaration,
	typeNamesToFind: string[],
): ImportSpecifier | undefined {
	const foundTypeName = typeNamesToFind.find(
		(typeName) => typeName === node.name.text,
	);
	if (foundTypeName) {
		return {
			importType: 'named',
			importPath: null,
			importName: node.name.text,
			importPropertyName: undefined,
		};
	}
	return undefined;
}

function handleTypeAliasDeclaration(
	node: TypeAliasDeclaration,
	typeNamesToFind: string[],
): ImportSpecifier | undefined {
	const foundTypeName = typeNamesToFind.find(
		(typeName) => typeName === node.name.text,
	);
	if (foundTypeName) {
		return {
			importType: 'named',
			importPath: null,
			importName: node.name.text,
			importPropertyName: undefined,
		};
	}
	return undefined;
}
