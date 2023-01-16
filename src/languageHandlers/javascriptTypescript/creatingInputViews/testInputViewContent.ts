import {
	addMultiLineComment,
	addSingleLineComment,
	createEmptyLineNode,
	createEmptyNode,
	createInternalFuncExpectsIdentifierName,
	createVariableStatement,
	defaultExportFunctionName,
	describeIdentifierName,
	ioViewIdentifierPostFix,
	TestableFunction,
	testDescriptionIdentifierName,
} from '@testent/shared-code-processing';
import { factory, Node, SyntaxKind } from 'typescript';
import { TestCase } from '../../../types/types';
import { tsNodesToString } from '../utils/tsNodesToString';
import { createInputsSection } from './shared/createInputsSection';
import { createRandomIdentifier } from './shared/createRandomIdentifier';
import { getTypeImportsSection } from './shared/getTypeImportsSection';
import { headerSectionCommentTestInputView } from './shared/headerSectionComment';
import { testCaseHeaderSectionComment } from './shared/useCaseHeaderSectionComment';

function describeSectionComment({ functionName }: { functionName: string }) {
	return `Give describe text for tests of "${functionName}"-function
@testent describe-text
`;
}

const testCaseDescriptionComment = 'Give the description for this test case';

/**
 * Create the content of the Test Input View document.
 *
 * @param testableFunction
 * @param existingTestCases
 * @returns
 */
export function createTestInputViewContentString(
	testableFunction: TestableFunction,
	existingTestCases: TestCase[] | undefined,
): string {
	const allNodes: Node[] = [];
	const typeImportsSectionNodes = getTypeImportsSection(testableFunction);
	if (typeImportsSectionNodes != null) {
		allNodes.push(...typeImportsSectionNodes);
		allNodes.push(createEmptyLineNode());
	} else {
		allNodes.push(createEmptyNode());
	}

	const describeNode = describeSection(testableFunction.name);
	allNodes.push(describeNode, createEmptyLineNode());

	const testCasesSectionNodes = testCasesSection(
		testableFunction,
		existingTestCases,
	);
	allNodes.push(...testCasesSectionNodes);

	addMultiLineComment(
		allNodes[0],
		headerSectionCommentTestInputView({
			functionName: testableFunction.name,
			fileId: {
				filePath: testableFunction.sourceFilePath,
				functionName: testableFunction.name,
			},
		}),
	);

	return tsNodesToString(allNodes);
}

function describeSection(functionName: string | undefined): Node {
	const node = createVariableStatement(
		describeIdentifierName,
		factory.createStringLiteral(`Test the '${functionName}' function`),
		factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
	);
	addMultiLineComment(
		node,
		describeSectionComment({
			functionName: functionName ? functionName : defaultExportFunctionName,
		}),
	);
	return node;
}

function testCasesSection(
	testableFunction: TestableFunction,
	existingTestCases: TestCase[] | undefined,
): Node[] {
	const nodes: Node[] = [];

	const existingTestCaseNodes = createExistingTestCases(existingTestCases);
	if (existingTestCaseNodes !== undefined) {
		nodes.push(...existingTestCaseNodes);
	}
	const newTestCaseInputNodes = createNewTestCaseInputNodes(testableFunction);
	nodes.push(...newTestCaseInputNodes);

	return nodes;
}

function createExistingTestCases(
	existingTestCases: TestCase[] | undefined,
): Node[] {
	return [];
}

function createNewTestCaseInputNodes(
	testableFunction: TestableFunction,
): Node[] {
	const nodes: Node[] = [];

	const runCaseRandomIdentifier = createRandomIdentifier();

	const testDescription = createVariableStatement(
		`${testDescriptionIdentifierName}${ioViewIdentifierPostFix}${runCaseRandomIdentifier}`,
		factory.createStringLiteral(
			`Write here the description for test ${runCaseRandomIdentifier}`,
		),
		factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
	);
	addMultiLineComment(
		testDescription,
		testCaseHeaderSectionComment(runCaseRandomIdentifier),
	);
	addSingleLineComment(testDescription, testCaseDescriptionComment);
	nodes.push(testDescription, createEmptyLineNode());

	const testInternalsSwitch = createVariableStatement(
		`${createInternalFuncExpectsIdentifierName}${ioViewIdentifierPostFix}${runCaseRandomIdentifier}`,
		factory.createFalse(),
		factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
	);

	addSingleLineComment(
		testInternalsSwitch,
		`Choose if you want to test the internals of the test case ${runCaseRandomIdentifier}`,
	);
	nodes.push(testInternalsSwitch, createEmptyLineNode());

	if (testableFunction.args.length > 0) {
		const inputNodes = createInputsSection(
			testableFunction.args,
			runCaseRandomIdentifier,
		);
		nodes.push(...inputNodes);
	} else {
		const emptyNode = createEmptyNode();
		addSingleLineComment(emptyNode, ' Function has no input arguments');
		nodes.push(emptyNode);
	}

	return nodes;
}

export function createNewTestCaseInputString(
	testableFunction: TestableFunction,
): string {
	const nodes = createNewTestCaseInputNodes(testableFunction);
	const content = tsNodesToString(nodes);
	return content;
}
