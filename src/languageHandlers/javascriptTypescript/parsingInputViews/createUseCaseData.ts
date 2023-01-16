import {
	clearNameText,
	createNewIdentifierFromOld,
	createVariableStatement,
	InValidNodeTypeError,
	TestableFunction,
	UseCaseInput,
} from '@testent/shared-code-processing';
import {
	createSourceFile,
	factory,
	isIdentifier,
	isStringLiteral,
	isVariableStatement,
	ScriptTarget,
	SyntaxKind,
	TypeNode,
} from 'typescript';
import {
	isCreateInternalFuncExpect,
	isInput,
	isTestDescription,
} from '../isFunctions';

export function createUseCaseData(
	id: string,
	code: string,
	testableFunction: TestableFunction,
): {
	id: string;
	caseInputs: UseCaseInput[];
	caseDescription?: string;
	internalFunctionExpects?: boolean;
} {
	const tsSourceFile = createSourceFile('', code, ScriptTarget.Latest);

	const caseInputs: UseCaseInput[] = [];
	let caseDescription: string | undefined;
	let internalFunctionExpects: boolean | undefined;

	tsSourceFile.forEachChild((node) => {
		if (!isVariableStatement(node)) {
			return;
		}
		const varDec = node.declarationList.declarations[0];
		const nameIdentifier = varDec.name;
		if (!isIdentifier(nameIdentifier)) {
			throw new Error(
				`Type "${nameIdentifier.kind}"(Typescript Kind) not supported yet`,
			);
		}

		if (isInput(nameIdentifier, testableFunction) === true) {
			const inputIdentifier = createNewIdentifierFromOld(nameIdentifier, id);
			let inputType: TypeNode | undefined;
			if (varDec.type !== undefined) {
				const input = testableFunction.args.find(
					(arg) => arg.name === clearNameText(nameIdentifier.text),
				)!;
				if (input.optional === true) {
					const optionalType = factory.createUnionTypeNode([
						varDec.type,
						factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword),
					]);
					inputType = optionalType;
				} else {
					inputType = varDec.type;
				}
			} else {
				inputType = undefined;
			}
			const input = createVariableStatement(
				inputIdentifier,
				varDec.initializer,
				inputType,
			);
			caseInputs.push({ inputIdentifier, inputVarDec: input });
		} else if (isTestDescription(nameIdentifier) === true) {
			if (
				varDec.initializer === undefined ||
				!isStringLiteral(varDec.initializer)
			) {
				throw new InValidNodeTypeError(
					'Test description for test case is malformatted.',
					SyntaxKind.StringLiteral,
					varDec.initializer,
					'[22]',
				);
			}

			caseDescription = varDec.initializer.text;
		} else if (isCreateInternalFuncExpect(nameIdentifier) === true) {
			const boolValue = varDec.initializer;
			if (
				boolValue === undefined ||
				(boolValue.kind !== SyntaxKind.TrueKeyword &&
					boolValue.kind !== SyntaxKind.FalseKeyword)
			) {
				throw new InValidNodeTypeError(
					'Test description for test case is malformatted.',
					SyntaxKind.StringLiteral,
					varDec.initializer,
					'[22]',
				);
			}
			internalFunctionExpects = boolValue.kind === SyntaxKind.TrueKeyword;
		}
	});
	// TODO: check if all inputs are given by user
	// if (stringArraysMatch()) {
	// 	const message = `Not all inputs are given`;
	// 	const error = new Error(message);
	// 	Logger.error(error, message);
	// 	throw error;
	// }
	return {
		id,
		caseDescription,
		internalFunctionExpects,
		caseInputs,
	};
}
