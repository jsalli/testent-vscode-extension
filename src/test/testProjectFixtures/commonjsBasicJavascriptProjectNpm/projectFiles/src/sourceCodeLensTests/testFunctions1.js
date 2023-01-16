// esModuleExportNamedArrowFunction
export const namedArrowFunction = (myArg) => {
	return myArg.length > 0;
};

// esModuleExportDefaultFunction
export default function (myArg) {
	return `Big number: ${myArg * 1000}`;
}

// esModuleExportNamedFunction
export function namedFunction(myArg) {
	return myArg * 1000;
}

function privateFunction(myArg) {
	return `Big number: ${myArg * 1000}`;
}
