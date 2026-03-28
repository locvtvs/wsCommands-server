import { WebSocketServer } from "ws";
import WsWorker from './WsWorker';
import { 
	wsListenerCommandFowardRequest, 
	wsListenerCommandFowardToAllOrToOthersRequest, 
	wsListenerClientMessageToServer, 
	wsListenerClientEmitServerEvent, 
	wsListenerCommandFowardToGroupRequest 
} from './WsListenerHelpers';
import logt from "./logt";




const TAG = `WsServer.ts`;




export default class WsServer {
	consoleTag = `[Server]`;




	port:number = 3000; // default value, check 'WS_PORT' variable in your .env file.
	wss: WebSocketServer;
	clients: Record<string, WsWorker>;




	constructor(port:number|string|undefined) {
		let tag = this.consoleTag;




		logt(tag, `Initializing WebSocket Server...`);


		if (!port || (typeof port === "string" && port.length <= 0)) {
			logt(tag, `No WebSocket port, check the 'WS_PORT' variable in your .env file. Using defaut: ${this.port}`);
		} else {
			this.port = Number(port);
		}


		this.clients = {};
		this.wss = new WebSocketServer({port:this.port});


		this.wss.on("connection", ws => {


			const wsWorker = new WsWorker('-1', '-1', ws);
			wsListenerClientEmitServerEvent(this, wsWorker);
			wsListenerClientMessageToServer(this, wsWorker);
			wsListenerCommandFowardRequest(this, wsWorker);
			wsListenerCommandFowardToAllOrToOthersRequest(this, wsWorker);
			wsListenerCommandFowardToGroupRequest(this, wsWorker);


			wsWorker.ws.on('message', msg => {


				let data = JSON.parse(msg.toString());


				if (data.type === "HANDSHAKE_DONE") {


					let id = data.message.ws_id.toString();
					let group = data.message.content.ws_group_id.toString();


					wsWorker.id = id;
					wsWorker.group = group;

					
					if (id in this.clients) {
						try { this.clients[id].ws.close(); } catch(e:any) { logt(tag, `e:`, e.toString()); }
						delete this.clients[id];
					}


					logt(tag, `Connected: ${id} (group: ${group})`);


					wsWorker.ws = ws;
					this.clients[id] = wsWorker;

				}


			});




			wsWorker.ws.on('pong', () => {
				wsWorker.ws.ping();
			});




			wsWorker.ws.on('ping', () => {
				wsWorker.ws.pong(); // ! Do not remove, it's a workaround. I know 'pong' is sent automatically.
			});




			wsWorker.ws.on("close", () => {
				logt(tag, `Disconnected: ${wsWorker.id} (group: ${wsWorker.group})`);
			});




		});




	}




}
