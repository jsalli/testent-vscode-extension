// errorArrayDestructionInParams
export function arrayDestructionInParams(
	myArg,
	[my2ndArg],
) {
	return `${myArg} - ${my2ndArg}`;
}

// errorObjectDestructionInParams
export const aobjectDestructionInParams = (
	myArg,
	{ my2ndArg },
) => {
	return `${myArg} - ${my2ndArg}`;
};

// esModuleExportDefaultArrowFunction
export default (myArg) => {
	return `Hello ${myArg}!`;
};

const privateFunction = (myArg) => {
	return `Big number: ${myArg * 1000}`;
};
