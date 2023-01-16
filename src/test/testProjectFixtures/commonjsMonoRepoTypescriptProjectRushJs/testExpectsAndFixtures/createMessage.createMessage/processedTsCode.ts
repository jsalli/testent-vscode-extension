import { recorder as __recorder } from "/home/juha/.vscode/extensions/testent.testent-vscode-extension-0.1.6/dist/recorder/recorder";
import { capitalizeFirstLetter, validateEmail } from "./utils";
export default function createMessage(email: string, name: string, username: string): string {
    const __unit_test_id = __recorder.generateRandomString();
    function __orig_createMessage(email: string, name: string, username: string): string {
        if (email.length !== 0) {
            if (email.length > 0 && !(() => {
                const __temp_avugnt0pc = email;
                __recorder.recordInput({
                    recordId: {
                        folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                        fileName: "createMessage.ts",
                        functionName: "createMessage",
                        unitTestId: __unit_test_id
                    },
                    callDetails: {
                        parentValue: null,
                        recordedFunctionNameChain: ["validateEmail"],
                        async: false,
                        functionDetails: {
                            defaultImport: false,
                            propertyName: undefined,
                            name: "validateEmail",
                            moduleSpecifier: "./utils",
                            type: "importedFunction"
                        }
                    },
                    inputs: [{
                            index: 0,
                            varName: "__temp_avugnt0pc",
                            value: __temp_avugnt0pc,
                            override: null
                        }]
                });
                const __temp_a50kqqle2 = validateEmail(__temp_avugnt0pc);
                __recorder.recordOutput({
                    recordId: {
                        folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                        fileName: "createMessage.ts",
                        functionName: "createMessage",
                        unitTestId: __unit_test_id
                    },
                    callDetails: {
                        parentValue: null,
                        recordedFunctionNameChain: ["validateEmail"],
                        async: false,
                        functionDetails: {
                            defaultImport: false,
                            propertyName: undefined,
                            name: "validateEmail",
                            moduleSpecifier: "./utils",
                            type: "importedFunction"
                        }
                    },
                    outputs: {
                        varType: "notdestructed",
                        varName: "__temp_a50kqqle2",
                        value: __temp_a50kqqle2,
                        referencedProps: null
                    }
                });
                return __temp_a50kqqle2;
            })()) {
                throw new Error("email is not valid");
            }
        }
        else {
            throw new Error("email is empty");
        }
        if (username.length === 0) {
            throw new Error("username is empty");
        }
        if (name.length === 0) {
            throw new Error("User's name is empty");
        }
        const __temp_a41jdvgsi = (() => {
            const __temp_ajthj4i6m = (() => {
                const __temp_aba48tgv2 = name
                    .split(" ");
                return __temp_aba48tgv2;
            })();
            const __temp_a2anldkjb = __temp_ajthj4i6m.map((namePart) => {
                return (() => {
                    const __temp_aikpgnq3n = namePart;
                    __recorder.recordInput({
                        recordId: {
                            folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                            fileName: "createMessage.ts",
                            functionName: "createMessage",
                            unitTestId: __unit_test_id
                        },
                        callDetails: {
                            parentValue: null,
                            recordedFunctionNameChain: ["capitalizeFirstLetter"],
                            async: false,
                            functionDetails: {
                                defaultImport: false,
                                propertyName: undefined,
                                name: "capitalizeFirstLetter",
                                moduleSpecifier: "./utils",
                                type: "importedFunction"
                            }
                        },
                        inputs: [{
                                index: 0,
                                varName: "__temp_aikpgnq3n",
                                value: __temp_aikpgnq3n,
                                override: null
                            }]
                    });
                    const __temp_ajc2rf9r2 = capitalizeFirstLetter(__temp_aikpgnq3n);
                    __recorder.recordOutput({
                        recordId: {
                            folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                            fileName: "createMessage.ts",
                            functionName: "createMessage",
                            unitTestId: __unit_test_id
                        },
                        callDetails: {
                            parentValue: null,
                            recordedFunctionNameChain: ["capitalizeFirstLetter"],
                            async: false,
                            functionDetails: {
                                defaultImport: false,
                                propertyName: undefined,
                                name: "capitalizeFirstLetter",
                                moduleSpecifier: "./utils",
                                type: "importedFunction"
                            }
                        },
                        outputs: {
                            varType: "notdestructed",
                            varName: "__temp_ajc2rf9r2",
                            value: __temp_ajc2rf9r2,
                            referencedProps: null
                        }
                    });
                    return __temp_ajc2rf9r2;
                })();
            });
            return __temp_a2anldkjb;
        })();
        const capitalizedName = __temp_a41jdvgsi.join(" ");
        return (`User with email: ${email} has name: "${capitalizedName}".` +
            ` This Her/his username is '${username}'`);
    }
    try {
        __recorder.recordMainInputs({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "createMessage.ts",
                functionName: "createMessage",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_createMessage"],
                async: false,
                functionDetails: {
                    type: "mainFunction"
                }
            },
            inputs: [{
                    varType: "notdestructed",
                    varName: "email",
                    value: email,
                    referencedProps: [
                        [
                            "length"
                        ],
                        [
                            "length"
                        ]
                    ]
                }, {
                    varType: "notdestructed",
                    varName: "name",
                    value: name,
                    referencedProps: [
                        [
                            "length"
                        ],
                        [
                            "split"
                        ]
                    ]
                }, {
                    varType: "notdestructed",
                    varName: "username",
                    value: username,
                    referencedProps: [
                        [
                            "length"
                        ]
                    ]
                }]
        });
        const __orig_output = __orig_createMessage(email, name, username);
        __recorder.recordOutput({
            recordId: {
                folderPath: "/home/juha/workspace/testent/simple-typescript-project-example/src",
                fileName: "createMessage.ts",
                functionName: "createMessage",
                unitTestId: __unit_test_id
            },
            callDetails: {
                parentValue: null,
                recordedFunctionNameChain: ["__orig_createMessage"],
                async: false,
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
                fileName: "createMessage.ts",
                functionName: "createMessage",
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
