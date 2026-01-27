import { RawData } from "ws";
import WsWorker from './WsWorker';
import WsServer from './WsServer';
import logt from "./logt";




const TAG = `WsListenerHelpers.ts`;




export function wsListenerCommandFowardRequest(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerCommandFowardRequest()`;


		const handlerFunc = (msg: RawData) => {


				let data = JSON.parse(msg.toString());
				const TYPE_NAME = "CLT_TO_CLT_CMD";


				if (data.type === TYPE_NAME) {

								const senderWorker = data.message.ws_id;
								const targetWorker = data.message.content.ws_target_id;
								const cmd = data.message.content.cmd;
								const doCmd = `do ${cmd}`;


								logt(wsServer.tag, `From '${senderWorker}' to '${targetWorker}': ${cmd}`);


						try {

								if (!(targetWorker in wsServer.clients)) {
										throw new Error(`'${targetWorker}' doesn't exists.`);
								}


								wsServer.clients[targetWorker].sendCmd(doCmd);

						} catch(e: any) {

								let errorMsg = `'${TYPE_NAME}': ${e.toString()}`;
								logt(wsServer.tag, `[${senderWorker}] ${errorMsg}`);
								wsWorker.ws.send(errorMsg);

						}
				}
		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsListenerCommandFowardToAllRequest(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerCommandFowardToAllRequest()`;


		const handlerFunc = (msg: RawData) => {


				let data = JSON.parse(msg.toString());
				const TYPE_NAME_1 = "CLT_TO_ALL_CMD";
				const TYPE_NAME_2 = "CLT_TO_OTHERS_CMD";
				let typeName = `${TYPE_NAME_1}, ${TYPE_NAME_2}`;


				if (data.type === TYPE_NAME_1 || data.type === TYPE_NAME_2) {

								typeName = data.type;
								const senderWorker = data.message.ws_id;
								const targetWorker = data.type === TYPE_NAME_1 ? 'all' : 'others'; 
								const cmd = data.message.content.cmd;
								const doCmd = `do ${cmd}`;


								logt(wsServer.tag, `From '${senderWorker}' to ${targetWorker}: ${cmd}`);


						try {

								for(const ws_id in wsServer.clients) {
										if (ws_id !== senderWorker) {
											wsServer.clients[ws_id].sendCmd(doCmd);
										}
								}

								if (data.type === TYPE_NAME_1 && senderWorker in wsServer.clients) {
										wsServer.clients[senderWorker].sendCmd(doCmd);
								}

						} catch(e: any) {

								let errorMsg = `'${typeName}': ${e.toString()}`;
								logt(wsServer.tag, `[${senderWorker}] ${errorMsg}`);
								wsWorker.ws.send(errorMsg);

						}
				}
		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsCommandReplyListener(target: WsWorker, cmd: string, callback: Function, removeMode?: boolean) {
		let tag = `wsOnCommandReply(${cmd})`;


		const handlerFunc = (msg: RawData) => {

				let data = JSON.parse(msg.toString());

				if (data.type === `RESPONSE:${cmd}`) {
						callback(msg);
				}

		}


		if (removeMode) {
				target.ws.off('message', handlerFunc);
				return;
		}


		target.ws.once('message', handlerFunc);
}