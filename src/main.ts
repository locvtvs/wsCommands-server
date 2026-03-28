import 'dotenv/config';
import readline from "readline";
import WsServer from './WsServer';
import logt, { 
	APP_VERSION, 
	appendToLogFile, 
	defaultLocale, 
	logTime, 
	setReadlineInterfaceLogt 
} from "./logt";




const TAG = "main.ts";
let tag = `[Console]`;




const rl = readline.createInterface({
		prompt: "> ",
    input: process.stdin, 
    output: process.stdout,
    terminal: false
});




setReadlineInterfaceLogt(rl);




rl.on("line", async (input: string) => {


		appendToLogFile(`[${APP_VERSION}] [${logTime({ locale: defaultLocale })}] > ${input}`);




		rl.prompt();
		rl.pause();
		const command = input.trim();




		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		const regexCmdSend = /^sendcmd\s+(?!(?:-g|--group|-a|--all))(\S+)\s+(.+)$/;
		const regexCmdSendAll = /^sendcmd\s+(?:-a|--all)\s+(.+)$/;
		const regexCmdSendGroup = /^sendcmd\s+(?:-g|--group)\s+(\S+)\s+(.+)$/;
		// --------------------------------------------------------------------------
		const regexMsgSend = /^sendmsg\s+(?!(?:-g|--group|-a|--all))(\S+)\s+(.+)$/;
		const regexMsgSendAll = /^sendmsg\s+(?:-a|--all)\s+(.+)$/;
		const regexMsgSendGroup = /^sendmsg\s+(?:-g|--group)\s+(\S+)\s+(.+)$/;
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------




		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		if (command === "exit") {


				rl.close();
				process.exit(0);


		}
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		else if (
				(command.match(regexCmdSend) || command.match(regexMsgSend)) &&
				(
						(!command.match(regexCmdSendAll) && !command.match(regexMsgSendAll)) &&
						(!command.match(regexCmdSendGroup) || !command.match(regexMsgSendGroup))
				)
		) {


				const matchCmd = command.match(regexCmdSend);
				const matchMsg = command.match(regexMsgSend);


				if (matchCmd !== null || matchMsg !== null) {


						const match = matchCmd !== null ? matchCmd : matchMsg;
						if (match !== null) {


								const ws_id = match[1];
								const ws_cmd = `do ${match[2]}`;
								const ws_msg = `${match[2]}`;


								if (!(ws_id in wsServer.clients)) {
										logt(tag, `Client '${ws_id}' doesn't exists.`);
										return;
								}


								const client = wsServer.clients[ws_id];


								// todo: can be simplified...
								// --------------------------------------------------------------------------
								// --------------------------------------------------------------------------
								if (matchCmd !== null) {
										logt(tag, `Sending command to '${ws_id}': ${ws_cmd}`);
										client.sendCmd(ws_cmd);
								}
								// --------------------------------------------------------------------------
								// --------------------------------------------------------------------------
								else if (matchMsg !== null) {
										logt(tag, `Sending message to '${ws_id}': ${ws_cmd}`);
										client.sendMsg(ws_msg);
								}
								// --------------------------------------------------------------------------
								// --------------------------------------------------------------------------
								else {
										logt(tag, `Something went wrong (REGEX_SEND_CMD_OR_MSG).`);
								}
								// --------------------------------------------------------------------------
								// --------------------------------------------------------------------------


						}


				}


		}
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		else if (command.match(regexCmdSendGroup) || command.match(regexMsgSendGroup)) {


				const matchCmd = command.match(regexCmdSendGroup);
				const matchMsg = command.match(regexMsgSendGroup);


				if (matchCmd !== null || matchMsg !== null) {


						const match = matchCmd !== null ? matchCmd : matchMsg;
						if (match !== null) {


								const ws_group_id = match[1];
								const ws_cmd = `do ${match[2]}`;
								const ws_msg = `${match[2]}`;


								// todo: can be simplified...
								if (matchCmd !== null) {
									logt(tag, `Sending command to group '${ws_group_id}': ${ws_cmd}`);
								} else if (matchMsg !== null) {
									logt(tag, `Sending message to group '${ws_group_id}': ${ws_msg}`);
								} else {
									logt(tag, `Something went wrong (REGEX_SEND_GROUP_CMD_OR_MSG).`);
								}


								for(const ws_id in wsServer.clients) {


										const client = wsServer.clients[ws_id];
										

										if (client.group !== ws_group_id) { continue; }


										// todo: can be simplified...
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------
										if (matchCmd !== null) {
												client.sendCmd(ws_cmd);
										}
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------
										else if (matchMsg !== null) {
												client.sendMsg(ws_msg);
										}
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------


								}


						}


				}


		}
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		else if (command.match(regexCmdSendAll) || command.match(regexMsgSendAll)) {


				const matchCmd = command.match(regexCmdSendAll);
				const matchMsg = command.match(regexMsgSendAll);


				if (matchCmd !== null || matchMsg !== null) {


						const match = matchCmd !== null ? matchCmd : matchMsg;


						if (match !== null) {


								const ws_cmd = `do ${match[1]}`;
								const ws_msg = `${match[1]}`;


								// todo: can be simplified...
								if (matchCmd !== null) {
									logt(tag, `Sending command to all: ${ws_cmd}`);
								} else if (matchMsg !== null) {
									logt(tag, `Sending message to all: ${ws_msg}`);
								} else {
									logt(tag, `Something went wrong (REGEX_SEND_ALL_CMD_OR_MSG).`);
								}


								for(const ws_id in wsServer.clients) {

										
										// todo: can be simplified...
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------
										if (matchCmd !== null) {
												wsServer.clients[ws_id].sendCmd(ws_cmd);
										}
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------
										else if (matchMsg !== null) {
												wsServer.clients[ws_id].sendMsg(ws_msg);
										}
										// --------------------------------------------------------------------------
										// --------------------------------------------------------------------------


								}


						}


				}


		}
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------
		else {
				if (command.trim().replaceAll(` `,``) !== "") {
						logt(tag, `Unknown command: ${command}`);
				}
		}
		// --------------------------------------------------------------------------
		// --------------------------------------------------------------------------




		rl.resume();


});




rl.prompt();




const wsServer = new WsServer(process.env.WS_PORT);
