import { recorder as __recorder } from "/home/juha/workspace/testent/testent-monorepo/packages/vscode-extension/dist/recorder/recorder";
import axios from 'axios';
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}
const baseUrl = 'https://jsonplaceholder.typicode.com/users/';
export async function getUserDetailsById(userId: number): Promise<{
    username: string;
    name: string;
    email: string;
}> {
    const __unit_test_id = __recorder.generateRandomString();
    async function __orig_getUserDetailsById(userId: number): Promise<{
        username: string;
        name: string;
        email: string;
    }> {
        if (userId < 0) {
            throw new Error(`Given user ID is invalid. Got: ${userId}, expected value >=0`);
        }
        const url = `${baseUrl}${userId}`;
        const __temp_a5lgqn4sm = url;
        __recorder.recordInput({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsById",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: axios,
                recordedFunctionNameChain: ["axios", "get"],
                async: true,
                functionDetails: {
                    defaultImport: true,
                    propertyName: undefined,
                    name: "axios",
                    moduleSpecifier: "axios",
                    type: "importedFunction"
                }
            },
            inputs: [{
                    index: 0,
                    varName: "__temp_a5lgqn4sm",
                    value: __temp_a5lgqn4sm,
                    override: null
                }]
        });
        const response = await axios.get(__temp_a5lgqn4sm);
        __recorder.recordOutput({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsById",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: axios,
                recordedFunctionNameChain: ["axios", "get"],
                async: true,
                functionDetails: {
                    defaultImport: true,
                    propertyName: undefined,
                    name: "axios",
                    moduleSpecifier: "axios",
                    type: "importedFunction"
                }
            },
            outputs: {
                varType: "notdestructed",
                varName: "response",
                value: response,
                referencedProps: [
                    [
                        "data"
                    ]
                ]
            }
        });
        const user = response.data as User;
        return { username: user.username, name: user.name, email: user.email };
    }
    try {
        __recorder.recordMainInputs({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsById",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_getUserDetailsById"],
                async: true,
                functionDetails: {
                    type: "mainFunction"
                }
            },
            inputs: [{
                    varType: "notdestructed",
                    varName: "userId",
                    value: userId,
                    referencedProps: null
                }]
        });
        const __orig_output = await __orig_getUserDetailsById(userId);
        __recorder.recordOutput({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsById",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_getUserDetailsById"],
                async: true,
                functionDetails: {
                    type: "mainFunction"
                }
            },
            outputs: {
                varType: "notdestructed",
                varName: "__orig_output",
                value: __orig_output,
                referencedProps: null
            }
        });
        return __orig_output;
    }
    catch (__error) {
        __recorder.recordThrow({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsById",
                unitTestId: __unit_test_id
            },
            error: {
                mainFunction: true,
                errorVarName: "__error",
                errorObj: __error
            }
        });
        throw __error;
    }
}
export async function getUserDetailsByIdTryCatch(userId: number): Promise<{
    username: string;
    name: string;
    email: string;
}> {
    if (userId < 0) {
        throw new Error(`Given user ID is invalid. Got: ${userId}, expected value >=0`);
    }
    try {
        const url = `${baseUrl}${userId}`;
        const response = await axios.get(url);
        const user = response.data as User;
        return { username: user.username, name: user.name, email: user.email };
    }
    catch (error) {
        throw new Error('Error fetching data from API');
    }
}
