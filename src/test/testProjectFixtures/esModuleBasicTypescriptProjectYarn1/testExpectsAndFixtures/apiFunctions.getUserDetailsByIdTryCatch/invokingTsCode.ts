import { RecordSaverService } from "/home/juha/workspace/testent/testent-monorepo/packages/vscode-extension/dist/recorder/RecordSaverService";
import net from "net";
async function main() { const recSaveServ = new RecordSaverService; const socket = await new Promise((res, rej) => {
    const clientSocket = new net.Socket();
    clientSocket.on("error", error => {
        rej("Could not connect to the socket.\\nReason:" + error.code);
    });
    clientSocket.connect(7123, "127.0.0.1", () => {
        console.log("Connected to Local Record IPC Server");
        res(clientSocket);
    });
}); const userId__af4huai8d: number = -1; try {
    const output__af4huai8d = await getUserDetailsByIdTryCatch(userId__af4huai8d);
}
catch { } const userId__aag7g7esl: number = 0; try {
    const output__aag7g7esl = await getUserDetailsByIdTryCatch(userId__aag7g7esl);
}
catch { } const userId__aqgrrrs01: number = 1; try {
    const output__aqgrrrs01 = await getUserDetailsByIdTryCatch(userId__aqgrrrs01);
}
catch { } const recordsArray = recSaveServ.getRecords(); socket.write(JSON.stringify(recordsArray)); socket.end(); }
main().catch(error => {
    console.log(error);
    if (error === "ECONNREFUSED") {
        process.exit(3);
    }
    process.exit(4);
});
