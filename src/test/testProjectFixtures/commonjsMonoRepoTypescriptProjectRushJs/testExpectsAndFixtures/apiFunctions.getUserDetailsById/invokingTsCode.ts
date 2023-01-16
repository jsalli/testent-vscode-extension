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
}); const userId__ald7bjf31: number = -1; try {
    const output__ald7bjf31 = await getUserDetailsById(userId__ald7bjf31);
}
catch { } const userId__a5oroagmi: number = 0; try {
    const output__a5oroagmi = await getUserDetailsById(userId__a5oroagmi);
}
catch { } const userId__ap92j57ls: number = 1; try {
    const output__ap92j57ls = await getUserDetailsById(userId__ap92j57ls);
}
catch { } const recordsArray = recSaveServ.getRecords(); socket.write(JSON.stringify(recordsArray)); socket.end(); }
main().catch(error => {
    console.log(error);
    if (error === "ECONNREFUSED") {
        process.exit(3);
    }
    process.exit(4);
});
