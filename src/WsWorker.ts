import { WebSocket, /* WebSocketServer, RawData */ } from "ws";
import logt from "./logt";
// import { wsResponseListener } from '@/WsListenerHelpers';




const TAG = `WsWorker.ts`;




export default class WsWorker {


		id: string;
		group: string;
		ws: WebSocket;




		constructor(id:string, group: string, ws: WebSocket) {
				this.id = id;
				this.group = group;
				this.ws = ws;
		}




		// TODO: unify sendCmd and sendMsg
		sendCmd(
			cmd:string, 
			sender: string = process.env.WS_ID ? process.env.WS_ID.toLowerCase().trim().replaceAll(` `,``) : `wsc_server`, 
			senderGroup: string = "-1",
		) {
				let tag = `sendCmd()`;


				// this.ws.send(JSON.stringify({
				// 		msg: cmd,
				// 		sender: sender,
				// 		sender_group: senderGroup,
				// }));


				this.sendMsg(cmd, sender, senderGroup);


				// wsResponseListener(this, cmd, (rawData: RawData) => {
				// 		let data = JSON.parse(rawData.toString());
				// 		logt(`[Console]`, `[${data.message.ws_id}] ${data.message.content.toString().replace("do ","")}`);
				// });


		}




		// TODO: unify sendCmd and sendMsg
		sendMsg(
			msg:string, 
			sender: string = process.env.WS_ID ? process.env.WS_ID.toLowerCase().trim().replaceAll(` `,``) : `wsc_server`, 
			senderGroup: string = "-1",
		) {
				let tag = `sendMsg()`;


				this.ws.send(JSON.stringify({
						msg: msg,
						sender: sender,
						senderGroup: senderGroup,
				}));


		}


}
