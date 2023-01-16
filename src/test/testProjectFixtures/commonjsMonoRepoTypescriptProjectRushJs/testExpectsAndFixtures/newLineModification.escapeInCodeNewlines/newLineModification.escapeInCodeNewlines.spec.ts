import { escapeInCodeNewlines } from "./newLineModification";

describe("Test the 'escapeInCodeNewlines' function", () => {
    it("Testing with new line", () => {
        //Arrange
        //Setting inputs
        const code = "FILL \n THIS";
        
        //Setting output
        const expectedOutput = [
            "Escaped 1: FILL \\n THIS"
        ];
        
        //Act
        const callOutput = escapeInCodeNewlines(code);
        
        //Assert output
        expect(callOutput).toEqual(expectedOutput);
    });
    
});
