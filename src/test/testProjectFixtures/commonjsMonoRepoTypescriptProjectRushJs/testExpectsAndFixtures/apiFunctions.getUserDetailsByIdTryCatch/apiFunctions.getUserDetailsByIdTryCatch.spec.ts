import { getUserDetailsByIdTryCatch } from "./apiFunctions";
import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios, true);

describe("Test the 'getUserDetailsByIdTryCatch' function", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    it("Write here the description for test DEF", async () => {
        //Arrange
        //Setting inputs
        const userId = -1;
        
        //Act and Assert throw
        expect(async () => await getUserDetailsByIdTryCatch(userId)).rejects.toThrowError("Given user ID is invalid. Got: -1, expected value >=0");
    });
    
    it("Write here the description for test EFG", async () => {
        //Arrange
        //Setting inputs
        const userId = 0;
        
        //Mocking functions and objects
        mockedAxios.get.mockRejectedValueOnce(() => { throw new Error("Request failed with status code 404"); });
        
        //Act and Assert throw
        expect(async () => await getUserDetailsByIdTryCatch(userId)).rejects.toThrowError("Error fetching data from API");
    });
    
    it("Write here the description for test FGH", async () => {
        //Arrange
        //Setting inputs
        const userId = 1;
        
        //Setting output
        const expectedOutput = { username: "Bret", name: "Leanne Graham", email: "Sincere@april.biz" };
        
        //Mocking functions and objects
        mockedAxios.get.mockResolvedValueOnce({ data: { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz", address: { street: "Kulas Light", suite: "Apt. 556", city: "Gwenborough", zipcode: "92998-3874", geo: { lat: "-37.3159", lng: "81.1496" } }, phone: "1-770-736-8031 x56442", website: "hildegard.org", company: { name: "Romaguera-Crona", catchPhrase: "Multi-layered client-server neural-net", bs: "harness real-time e-markets" } } });
        
        //Act
        const callOutput = await getUserDetailsByIdTryCatch(userId);
        
        //Assert output
        expect(callOutput).toEqual(expectedOutput);
    });
    
});
