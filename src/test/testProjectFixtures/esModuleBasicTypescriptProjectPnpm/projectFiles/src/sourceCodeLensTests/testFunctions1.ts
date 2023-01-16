// esModuleExportNamedArrowFunction
export const namedArrowFunction = (myArg: string): boolean => {
	return myArg.length > 0;
};

// esModuleExportDefaultFunction
export default function (myArg: number): string {
	return `Big number: ${myArg * 1000}`;
}

// esModuleExportNamedFunction
export function namedFunction(myArg: number): number {
	return myArg * 1000;
}

function privateFunction(myArg: number): string {
	return `Big number: ${myArg * 1000}`;
}
