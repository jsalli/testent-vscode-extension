import { getUserDetailsById } from "./apiFunctions";
import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios, true);

describe("Test the 'getUserDetailsById' function", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    it("Write here the description for test KLM", async () => {
        //Arrange
        //Setting inputs
        const userId = -1;
        
        //Act and Assert throw
        expect(async () => await getUserDetailsById(userId)).rejects.toThrowError("Given user ID is invalid. Got: -1, expected value >=0");
    });
    
    it("Write here the description for test LMN", async () => {
        //Arrange
        //Setting inputs
        const userId = 0;
        
        //Mocking functions and objects
        mockedAxios.get.mockRejectedValueOnce(() => { throw new Error("Request failed with status code 404"); });
        
        //Act and Assert throw
        expect(async () => await getUserDetailsById(userId)).rejects.toThrowError("Request failed with status code 404");
        
        //Assert function under test internals
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users/0");
    });
    
    it("Write here the description for test MNO", async () => {
        //Arrange
        //Setting inputs
        const userId = 1;
        
        //Setting output
        const expectedOutput = { username: "Bret", name: "Leanne Graham", email: "Sincere@april.biz" };
        
        //Mocking functions and objects
        mockedAxios.get.mockResolvedValueOnce({ data: { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz", address: { street: "Kulas Light", suite: "Apt. 556", city: "Gwenborough", zipcode: "92998-3874", geo: { lat: "-37.3159", lng: "81.1496" } }, phone: "1-770-736-8031 x56442", website: "hildegard.org", company: { name: "Romaguera-Crona", catchPhrase: "Multi-layered client-server neural-net", bs: "harness real-time e-markets" } } });
        
        //Act
        const callOutput = await getUserDetailsById(userId);
        
        //Assert output
        expect(callOutput).toEqual(expectedOutput);
        
        //Assert function under test internals
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/users/1");
    });
    
});
