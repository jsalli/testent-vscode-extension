import { Expression, factory, SyntaxKind, TypeNode } from 'typescript';

export function createDefaultValue(type: TypeNode | undefined): {
	defaultValue: Expression;
	valueAsString: string;
} {
	if (type === undefined) {
		return {
			defaultValue: factory.createIdentifier('undefined'),
			valueAsString: 'undefined',
		};
	}

	switch (type.kind) {
		case SyntaxKind.BooleanKeyword:
			return { defaultValue: factory.createFalse(), valueAsString: 'false' };
		case SyntaxKind.NumberKeyword:
			return {
				defaultValue: factory.createNumericLiteral(-999),
				valueAsString: '-999',
			};
		case SyntaxKind.StringKeyword:
			return {
				defaultValue: factory.createStringLiteral('FILL THIS'),
				valueAsString: 'FILL THIS',
			};
		default:
			return {
				defaultValue: factory.createIdentifier('undefined'),
				valueAsString: 'undefined',
			};
	}
}
