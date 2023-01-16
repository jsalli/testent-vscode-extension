import { RecordSaverService } from "/home/juha/.vscode/extensions/testent.testent-vscode-extension-0.1.6/dist/recorder/RecordSaverService";
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
}); const email__aq4tbqutr: string = "FILL THIS"; const name__aq4tbqutr: string = "FILL THIS"; const username__aq4tbqutr: string = "FILL THIS"; try {
    const output__aq4tbqutr = createMessage(email__aq4tbqutr, name__aq4tbqutr, username__aq4tbqutr);
}
catch { } const email__aackn41nu: string = "test@test.com"; const name__aackn41nu: string = "Test Person"; const username__aackn41nu: string = "tperson"; try {
    const output__aackn41nu = createMessage(email__aackn41nu, name__aackn41nu, username__aackn41nu);
}
catch { } const recordsArray = recSaveServ.getRecords(); socket.write(JSON.stringify(recordsArray)); socket.end(); }
main().catch(error => {
    console.log(error);
    if (error === "ECONNREFUSED") {
        process.exit(3);
    }
    process.exit(4);
});
