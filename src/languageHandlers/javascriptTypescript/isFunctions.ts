import {
	clearNameText,
	createInternalFuncExpectsIdentifierName,
	TestableFunction,
	testDescriptionIdentifierName,
} from '@testent/shared-code-processing';
import { Identifier } from 'typescript';

export function isInput(
	name: Identifier,
	testableFunction: TestableFunction,
): boolean {
	return testableFunction.args.some(
		(arg) => arg.name === clearNameText(name.text),
	);
}

export function isTestDescription(name: Identifier): boolean {
	return name.text.startsWith(testDescriptionIdentifierName);
}

export function isCreateInternalFuncExpect(name: Identifier): boolean {
	return name.text.startsWith(createInternalFuncExpectsIdentifierName);
}
