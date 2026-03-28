import { RawData } from "ws";
import WsWorker from './WsWorker';
import WsServer from './WsServer';
import logt from "./logt";
import { emitter } from "./emitter";
import { formatPlaceholder } from "./Utils";




const TAG = `WsListenerHelpers.ts`;




export const STRING_PLACEHOLDER = {
	MESSAGE: "%%msg%%",
	COMMAND: "%%cmd%%",
}




export const TYPE_NAME = {


	EMIT_CLIENT_TO_SERVER_EVENT: "CLT_EMIT_SV_EVENT",

	MESSAGE_CLIENT_TO_CLIENT: "CLT_TO_CLT_MSG",
	MESSAGE_CLIENT_TO_ALL: "CLT_TO_ALL_MSG",
	MESSAGE_CLIENT_TO_OTHERS: "CLT_TO_OTHERS_MSG",
	MESSAGE_CLIENT_TO_SERVER: "CLT_TO_SV_MSG",
	MESSAGE_CLIENT_TO_GROUP: "CLT_TO_GROUP_MSG",
	MESSAGE_CLIENT_TO_GROUP_EXCEPT: "CLT_TO_GROUP_EXCEPT_MSG",
	MESSAGE_CLIENT_DISCONNECTED_TO_GROUP: "CLT_TO_GROUP_MSG_DC",

	COMMAND_CLIENT_TO_CLIENT: "CLT_TO_CLT_CMD",
	COMMAND_CLIENT_TO_ALL: "CLT_TO_ALL_CMD",
	COMMAND_CLIENT_TO_OTHERS: "CLT_TO_OTHERS_CMD",
	COMMAND_CLIENT_TO_GROUP: "CLT_TO_GROUP_CMD",
	COMMAND_CLIENT_TO_GROUP_EXCEPT: "CLT_TO_GROUP_EXCEPT_CMD",

	RESPONSE_WITH_PLACEHOLDER: `RESPONSE:${STRING_PLACEHOLDER.MESSAGE}`,


};



export function wsListenerClientEmitServerEvent(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerClientEmitServerEvent()`;


		const handlerFunc = (msg: RawData) => {


			let data = JSON.parse(msg.toString());


			if (data.type === TYPE_NAME.EMIT_CLIENT_TO_SERVER_EVENT) {

				
				const senderWorker = data.message.ws_id;
				const ev = data.message.content.ev;
				const stringifiedContent = String(data.message.content.msg)
																								.replaceAll("\\u0000", "")
																								.replaceAll("\u0000", "");


				logt(wsServer.consoleTag, `Server event emitted from '${senderWorker}': '${ev}' -> ${stringifiedContent}`);


				emitter.emit(ev, stringifiedContent);


			}


		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsListenerClientMessageToServer(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerClientMessageToServer()`;


		const handlerFunc = (rawData: RawData) => {


				let data = JSON.parse(rawData.toString());


				const DATA_TYPE_NAME = [
					TYPE_NAME.MESSAGE_CLIENT_TO_SERVER,
					TYPE_NAME.MESSAGE_CLIENT_TO_CLIENT,
					TYPE_NAME.MESSAGE_CLIENT_TO_ALL,
					TYPE_NAME.MESSAGE_CLIENT_TO_OTHERS,
				];


				const senderWorker = data.message.ws_id;
				const senderWorkerGroup = data.message.ws_group;
				const msg = data.message.content.msg;
				let dataTypeName;


				// ------------------------------------------------------------------------------------------------------------
				// ------------------------------------------------------------------------------------------------------------
				if (data.type === DATA_TYPE_NAME[0]) {


					logt(wsServer.consoleTag, `From '${senderWorker}' to server: ${msg}`);


				}
				// ------------------------------------------------------------------------------------------------------------
				// ------------------------------------------------------------------------------------------------------------
				else if (data.type === DATA_TYPE_NAME[1]) {


					const targetWorker = data.message.content.ws_target_id;
					logt(wsServer.consoleTag, `From '${senderWorker}' to '${targetWorker}': ${msg}`);


					try {

						if (!(targetWorker in wsServer.clients)) { throw new Error(`'${targetWorker}' doesn't exists.`); }
						wsServer.clients[targetWorker].sendMsg(msg, senderWorker, senderWorkerGroup);

					} catch(e: any) {

						let errorMsg = `'${DATA_TYPE_NAME[1]}': ${e.toString()}`;
						logt(wsServer.consoleTag, `[${senderWorker}] ${errorMsg}`);
						wsWorker.sendMsg(errorMsg, senderWorker, senderWorkerGroup);

					}


				}
				// ------------------------------------------------------------------------------------------------------------
				// ------------------------------------------------------------------------------------------------------------
				else if (data.type === DATA_TYPE_NAME[2] || data.type === DATA_TYPE_NAME[3]) {


					dataTypeName = data.type;
					const targetWorker = data.type === DATA_TYPE_NAME[2] ? 'all' : 'others'; 


					logt(wsServer.consoleTag, `From '${senderWorker}' to ${targetWorker}: ${msg}`);


					try {


						for(const ws_id in wsServer.clients) {
							if (ws_id !== senderWorker) { wsServer.clients[ws_id].sendMsg(msg, senderWorker, senderWorkerGroup); }
						}


						if (data.type === DATA_TYPE_NAME[2] && senderWorker in wsServer.clients) {
							wsServer.clients[senderWorker].sendMsg(msg, senderWorker, senderWorkerGroup);
						}


					} catch(e: any) {


						let errorMsg = `'${dataTypeName}': ${e.toString()}`;
						logt(wsServer.consoleTag, `[${senderWorker}] ${errorMsg}`);
						wsWorker.sendMsg(errorMsg, senderWorker, senderWorkerGroup);


					}


				}
				// ------------------------------------------------------------------------------------------------------------
				// ------------------------------------------------------------------------------------------------------------


		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsListenerCommandFowardRequest(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerCommandFowardRequest()`;


		const handlerFunc = (msg: RawData) => {


			let data = JSON.parse(msg.toString());


			if (data.type !== TYPE_NAME.COMMAND_CLIENT_TO_CLIENT) { return; }


			const senderWorker = data.message.ws_id;
			const senderWorkerGroup = data.message.ws_group;
			const targetWorker = data.message.content.ws_target_id;
			const cmd = data.message.content.cmd;
			const doCmd = `do ${cmd}`;


			logt(wsServer.consoleTag, `From '${senderWorker}' to '${targetWorker}': ${cmd}`);


			try {

				if (!(targetWorker in wsServer.clients)) {
					throw new Error(`'${targetWorker}' doesn't exists.`);
				}

				wsServer.clients[targetWorker].sendCmd(doCmd);

			} catch(e: any) {

				let errorMsg = `'${TYPE_NAME.COMMAND_CLIENT_TO_CLIENT}': ${e.toString()}`;
				logt(wsServer.consoleTag, `[${senderWorker}] ${errorMsg}`);
				wsWorker.sendMsg(errorMsg, senderWorker, senderWorkerGroup);

			}

				
		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsListenerCommandFowardToAllOrToOthersRequest(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerCommandFowardToAllOrToOthersRequest()`;


		const handlerFunc = (msg: RawData) => {


			let data = JSON.parse(msg.toString());
			let dataTypename;


			if (
					data.type !== TYPE_NAME.COMMAND_CLIENT_TO_ALL && 
					data.type !== TYPE_NAME.COMMAND_CLIENT_TO_OTHERS
			) {
				return;
			}


			dataTypename = data.type;


			const senderWorker = data.message.ws_id;
			const senderWorkerGroup = data.message.ws_group;
			const targetWorker = data.type === TYPE_NAME.COMMAND_CLIENT_TO_ALL ? 'all' : 'others'; 
			const cmd = data.message.content.cmd;
			const doCmd = `do ${cmd}`;


			logt(wsServer.consoleTag, `From '${senderWorker}' to ${targetWorker}: ${cmd}`);


			try {


				for(const ws_id in wsServer.clients) {
					if (ws_id !== senderWorker) {
						wsServer.clients[ws_id].sendCmd(doCmd);
					}
				}

				if (data.type === TYPE_NAME.COMMAND_CLIENT_TO_ALL && senderWorker in wsServer.clients) {
					wsServer.clients[senderWorker].sendCmd(doCmd);
				}


			} catch(e: any) {


				let errorMsg = `'${dataTypename}': ${e.toString()}`;
				logt(wsServer.consoleTag, `[${senderWorker}] ${errorMsg}`);
				wsWorker.sendMsg(errorMsg, senderWorker, senderWorkerGroup);


			}


		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsListenerCommandFowardToGroupRequest(wsServer: WsServer, wsWorker: WsWorker) {
		let tag = `wsListenerCommandFowardToGroupRequest()`;


		const handlerFunc = (rawData: RawData) => {


			let data = JSON.parse(rawData.toString());
			let dataTypename;


			if (
				data.type !== TYPE_NAME.COMMAND_CLIENT_TO_GROUP && 
				data.type !== TYPE_NAME.COMMAND_CLIENT_TO_GROUP_EXCEPT && // todo: 'COMMAND_CLIENT_TO_GROUP_EXCEPT' seems useless... need review
				data.type !== TYPE_NAME.MESSAGE_CLIENT_TO_GROUP && 
				data.type !== TYPE_NAME.MESSAGE_CLIENT_TO_GROUP_EXCEPT && // todo: 'MESSAGE_CLIENT_TO_GROUP_EXCEPT' seems useless... need review
				data.type !== TYPE_NAME.MESSAGE_CLIENT_DISCONNECTED_TO_GROUP
			) {
				return;
			}


			dataTypename = data.type;


			const senderWorker = data.message.ws_id;
			const senderWorkerGroup = data.message.ws_group;
			const targetGroup = data.message.content.ws_group_id;
			let msg = data.message.content.msg;
			const cmd = data.message.content.cmd;
			const doCmd = `do ${cmd}`;


			if (data.type === TYPE_NAME.MESSAGE_CLIENT_DISCONNECTED_TO_GROUP) {
				msg = `A client has been disconnected from Map Server: '${senderWorker}' (group: '${targetGroup}')`;
			}


			// todo: clean code required here...
			if (data.type === TYPE_NAME.COMMAND_CLIENT_TO_GROUP || data.type === TYPE_NAME.COMMAND_CLIENT_TO_GROUP_EXCEPT) {
					logt(wsServer.consoleTag, `Command sent from '${senderWorker}' (${senderWorkerGroup}) to group '${targetGroup}': ${cmd}`);
			} else {
					logt(wsServer.consoleTag, `Message sent from '${senderWorker}' (${senderWorkerGroup}) to group '${targetGroup}': ${msg}`);
			}




			try {


				// todo: clean code required here...
				for(const ws_id in wsServer.clients) {
					if (ws_id !== senderWorker && wsServer.clients[ws_id].group === targetGroup) {
						if (data.type === TYPE_NAME.COMMAND_CLIENT_TO_GROUP) {
							wsServer.clients[ws_id].sendCmd(doCmd, senderWorker, senderWorkerGroup);
						} else {
							wsServer.clients[ws_id].sendMsg(msg, senderWorker, senderWorkerGroup);
						}
					}
				}


				// todo: clean code required here...
				if (
						senderWorker in wsServer.clients && 
						wsServer.clients[senderWorker].group === targetGroup
				) {
					if (data.type === TYPE_NAME.COMMAND_CLIENT_TO_GROUP) {
						wsServer.clients[senderWorker].sendCmd(doCmd, senderWorker, senderWorkerGroup);
					} else if(data.type === TYPE_NAME.MESSAGE_CLIENT_TO_GROUP || data.type === TYPE_NAME.MESSAGE_CLIENT_DISCONNECTED_TO_GROUP) {
						wsServer.clients[senderWorker].sendMsg(msg, senderWorker, senderWorkerGroup);
					}
				}




			} catch(e: any) {


				let errorMsg = `'${dataTypename}': ${e.toString()}`;
				logt(wsServer.consoleTag, `[${senderWorker}] ${errorMsg}`);
				wsWorker.sendMsg(errorMsg, senderWorker, senderWorkerGroup);


			}


		};


		wsWorker.ws.on('message', handlerFunc);


}




export function wsResponseListener(target: WsWorker, msg: string, callback: Function,  /* removeMode?: boolean */) {
		let tag = `wsResponseListener(${msg})`;


		const handlerFunc = (rawData: RawData) => {


			const receivedTypeName = formatPlaceholder(
				JSON.parse(rawData.toString()).type, 
				[{placeholder: STRING_PLACEHOLDER.MESSAGE, value: msg}]
			);


			const dataTypeName = formatPlaceholder(
				TYPE_NAME.RESPONSE_WITH_PLACEHOLDER, 
				[{placeholder: STRING_PLACEHOLDER.MESSAGE, value: msg}]
			);


			if (receivedTypeName !== dataTypeName) { return; }


			callback(rawData);


		}


		// // if (removeMode) { target.ws.off('message', handlerFunc); return; }


		target.ws.once('message', handlerFunc);


}
