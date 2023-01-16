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
    if (userId < 0) {
        throw new Error(`Given user ID is invalid. Got: ${userId}, expected value >=0`);
    }
    const url = `${baseUrl}${userId}`;
    const response = await axios.get(url);
    const user = response.data as User;
    return { username: user.username, name: user.name, email: user.email };
}
export async function getUserDetailsByIdTryCatch(userId: number): Promise<{
    username: string;
    name: string;
    email: string;
}> {
    const __unit_test_id = __recorder.generateRandomString();
    async function __orig_getUserDetailsByIdTryCatch(userId: number): Promise<{
        username: string;
        name: string;
        email: string;
    }> {
        if (userId < 0) {
            throw new Error(`Given user ID is invalid. Got: ${userId}, expected value >=0`);
        }
        try {
            const url = `${baseUrl}${userId}`;
            const __temp_aoj5bh2or = url;
            __recorder.recordInput({
                recordId: {
                    folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                    fileName: "apiFunctions.ts",
                    functionName: "getUserDetailsByIdTryCatch",
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
                        varName: "__temp_aoj5bh2or",
                        value: __temp_aoj5bh2or,
                        override: null
                    }]
            });
            const response = await axios.get(__temp_aoj5bh2or);
            __recorder.recordOutput({
                recordId: {
                    folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                    fileName: "apiFunctions.ts",
                    functionName: "getUserDetailsByIdTryCatch",
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
        catch (error) {
            __recorder.recordThrow({
                recordId: {
                    folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                    fileName: "apiFunctions.ts",
                    functionName: "getUserDetailsByIdTryCatch",
                    unitTestId: __unit_test_id
                },
                error: {
                    mainFunction: false,
                    errorVarName: "error",
                    errorObj: error
                }
            });
            throw new Error('Error fetching data from API');
        }
    }
    try {
        __recorder.recordMainInputs({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsByIdTryCatch",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_getUserDetailsByIdTryCatch"],
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
        const __orig_output = await __orig_getUserDetailsByIdTryCatch(userId);
        __recorder.recordOutput({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "apiFunctions.ts",
                functionName: "getUserDetailsByIdTryCatch",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_getUserDetailsByIdTryCatch"],
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
                functionName: "getUserDetailsByIdTryCatch",
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
