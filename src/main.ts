import readline from "readline";
import WsServer from './WsServer';
import logt, { setReadlineInterfaceLogt } from "./logt";




const TAG = "main.ts";
let tag = `[Console]`;




const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: "> "
});




setReadlineInterfaceLogt(rl);




rl.on("line", async (input: string) => {
		rl.prompt();
		const command = input.trim();


		const regexCmdSend = /^send\s+"([^"]+)"\s+(.+)$/;
		const regexCmdSendAll = /^send all\s+(.+)$/;


		if (command === "exit") {

				rl.close();
				process.exit(0);

		} else if (command.match(regexCmdSend)) {

				const match = command.match(regexCmdSend);

				if (match !== null) {

						const ws_id = match[1];
						const ws_cmd = `do ${match[2]}`;


						if (!(ws_id in wsServer.clients)) {
								logt(tag, `Client '${ws_id}' doesn't exists.`);
								return;
						}


						logt(tag, `Sending to '${ws_id}': ${ws_cmd}`);


						const client = wsServer.clients[ws_id];
						client.sendCmd(ws_cmd);

				}

		} else if (command.match(regexCmdSendAll)) {

				const match = command.match(regexCmdSend);

				if (match !== null) {

						const ws_cmd = `do ${match[1]}`;
						logt(tag, `Sending to all: ${ws_cmd}`);
						for(const ws_id in wsServer.clients) {
								wsServer.clients[ws_id].sendCmd(ws_cmd);
						}

				}

		} else {

				logt(tag, `Unknown command: ${command}`);

		}

		rl.prompt();
});




rl.prompt();




const wsServer = new WsServer(3000);