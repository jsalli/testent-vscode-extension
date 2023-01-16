// errorArrayDestructionInParams
export function arrayDestructionInParams(
	myArg: string,
	[my2ndArg]: [my2ndArg: string],
): string {
	return `${myArg} - ${my2ndArg}`;
}

// errorObjectDestructionInParams
export const aobjectDestructionInParams = (
	myArg: string,
	{ my2ndArg }: { my2ndArg: string },
) => {
	return `${myArg} - ${my2ndArg}`;
};

// esModuleExportDefaultArrowFunction
export default (myArg: string): string => {
	return `Hello ${myArg}!`;
};

const privateFunction = (myArg: number): string => {
	return `Big number: ${myArg * 1000}`;
};
