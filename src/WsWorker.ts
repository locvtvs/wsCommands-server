import { WebSocketServer, WebSocket, RawData } from "ws";
import { wsCommandReplyListener } from '@/WsListenerHelpers';
import logt from "./logt";




const TAG = `WsWorker.ts`;




export default class WsWorker {


		id: string;
		ws: WebSocket;




		constructor(id:string, ws: WebSocket) {
				this.id = id;
				this.ws = ws;
		}




		sendCmd(cmd:string) {
				let tag = `sendCmd()`;


				this.ws.send(`${cmd}`);


				wsCommandReplyListener(this, cmd, (msg: RawData) => {
						let data = JSON.parse(msg.toString());
						logt(`[Console]`, `[${data.message.ws_id}] ${data.message.content.toString().replace("do ","")}`);
				});
		}


}