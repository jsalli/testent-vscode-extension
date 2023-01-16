import createMessage from "./createMessage";
import { validateEmail } from "./utils";
import { capitalizeFirstLetter } from "./utils";

jest.mock("./utils");
const mockedValidateEmail = jest.mocked(validateEmail, false);

jest.mock("./utils");
const mockedCapitalizeFirstLetter = jest.mocked(capitalizeFirstLetter, false);

describe("Test the 'createMessage' function", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    it("Write here the description for test DEF", () => {
        //Arrange
        //Setting inputs
        const email = "FILL THIS";
        const name = "FILL THIS";
        const username = "FILL THIS";
        
        //Mocking functions and objects
        mockedValidateEmail.mockReturnValueOnce(false);
        
        //Act and Assert throw
        expect(() => createMessage(email, name, username)).toThrowError("email is not valid");
    });
    
    it("Write here the description for test EFG", () => {
        //Arrange
        //Setting inputs
        const email = "test@test.com";
        const name = "Test Person";
        const username = "tperson";
        
        //Setting output
        const expectedOutput = "User with email: test@test.com has name: \"Test Person\". This Her/his username is 'tperson'";
        
        //Mocking functions and objects
        mockedValidateEmail.mockReturnValueOnce(true);
        mockedCapitalizeFirstLetter.mockReturnValueOnce("Test").mockReturnValueOnce("Person");
        
        //Act
        const callOutput = createMessage(email, name, username);
        
        //Assert output
        expect(callOutput).toBe(expectedOutput);
    });
    
});
