import { cutFromNewLine } from "./newLineModification";

describe("Test the 'cutFromNewLine' function", () => {
    it("Passing test with newline", () => {
        //Arrange
        //Setting inputs
        const text = "FILL \n THIS";
        
        //Setting output
        const expectedOutput = "FILL ";
        
        //Act
        const callOutput = cutFromNewLine(text);
        
        //Assert output
        expect(callOutput).toBe(expectedOutput);
    });
    
});
