import { recorder as __recorder } from "/home/juha/workspace/testent/testent-monorepo/packages/vscode-extension/dist/recorder/recorder";
import axios from 'axios';
const baseUrl = 'https://jsonplaceholder.typicode.com/users/';
export async function getUserDetailsById(userId) {
    const __unit_test_id = __recorder.generateRandomString();
    async function __orig_getUserDetailsById(userId) {
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
        const user = response.data;
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
export async function getUserDetailsByIdTryCatch(userId) {
    if (userId < 0) {
        throw new Error(`Given user ID is invalid. Got: ${userId}, expected value >=0`);
    }
    try {
        const url = `${baseUrl}${userId}`;
        const response = await axios.get(url);
        const user = response.data;
        return { username: user.username, name: user.name, email: user.email };
    }
    catch (error) {
        throw new Error('Error fetching data from API');
    }
}
import { RecordSaverService } from "/home/juha/workspace/testent/testent-monorepo/packages/vscode-extension/dist/recorder/RecordSaverService";
import net from "net";
async function main() {
    const recSaveServ = new RecordSaverService;
    const socket = await new Promise((res, rej) => {
        const clientSocket = new net.Socket();
        clientSocket.on("error", error => {
            rej("Could not connect to the socket.\\nReason:" + error.code);
        });
        clientSocket.connect(7123, "127.0.0.1", () => {
            console.log("Connected to Local Record IPC Server");
            res(clientSocket);
        });
    });
    const userId__ald7bjf31 = -1;
    try {
        const output__ald7bjf31 = await getUserDetailsById(userId__ald7bjf31);
    }
    catch { }
    const userId__a5oroagmi = 0;
    try {
        const output__a5oroagmi = await getUserDetailsById(userId__a5oroagmi);
    }
    catch { }
    const userId__ap92j57ls = 1;
    try {
        const output__ap92j57ls = await getUserDetailsById(userId__ap92j57ls);
    }
    catch { }
    const recordsArray = recSaveServ.getRecords();
    socket.write(JSON.stringify(recordsArray));
    socket.end();
}
main().catch(error => {
    console.log(error);
    if (error === "ECONNREFUSED") {
        process.exit(3);
    }
    process.exit(4);
});
//# sourceMappingURL=module.js.map