import {
	addMultiLineComment,
	addSingleLineComment,
	createEmptyLineNode,
	createEmptyNode,
	TestableFunction,
} from '@testent/shared-code-processing';
import { Node } from 'typescript';
import { tsNodesToString } from '../utils/tsNodesToString';
import { createInputsSection } from './shared/createInputsSection';
import { createRandomIdentifier } from './shared/createRandomIdentifier';
import { getTypeImportsSection } from './shared/getTypeImportsSection';
import { headerSectionCommentRunInputView } from './shared/headerSectionComment';
import { runCaseHeaderSectionComment } from './shared/useCaseHeaderSectionComment';

export function createRunInputViewContentString(
	testableFunction: TestableFunction,
	// fileId: string,
): string {
	const allNodes: Node[] = [];
	const typeImportsSectionNodes = getTypeImportsSection(testableFunction);
	if (typeImportsSectionNodes != null) {
		allNodes.push(...typeImportsSectionNodes);
		allNodes.push(createEmptyLineNode());
	} else {
		allNodes.push(createEmptyNode());
	}

	addMultiLineComment(
		allNodes[0],
		headerSectionCommentRunInputView({
			functionName: testableFunction.name,
			fileId: {
				filePath: testableFunction.sourceFilePath,
				functionName: testableFunction.name,
			},
		}),
	);

	const nodes = runCasesSection(testableFunction);

	allNodes.push(...nodes);

	return tsNodesToString(allNodes);
}

function runCasesSection(testableFunction: TestableFunction): Node[] {
	const nodes: Node[] = [];
	const emptyNode = createEmptyNode();

	const runCaseRandomIdentifier = createRandomIdentifier();
	addMultiLineComment(
		emptyNode,
		runCaseHeaderSectionComment(runCaseRandomIdentifier),
	);
	nodes.push(emptyNode);

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

export function createNewRunCaseInputString(
	testableFunction: TestableFunction,
): string {
	const nodes = runCasesSection(testableFunction);
	const content = tsNodesToString(nodes);
	return content;
}
