
import { WebSocketServer, WebSocket } from "ws";
import WsWorker from './WsWorker';
import { wsListenerCommandFowardRequest, wsCommandReplyListener, wsListenerCommandFowardToAllRequest } from './WsListenerHelpers';
import logt from "./logt";




const TAG = `WsServer.ts`;




export default class WsServer {


		tag = `[Server]`;
		port:number;
		wss: WebSocketServer;


		clients: Record<string, WsWorker>;


		constructor(port:number) {
				let tag = this.tag;


				logt(tag, `Initializing WebSocket Server...`);


				this.port = port;
				this.clients = {};
				this.wss = new WebSocketServer({port:this.port});


				this.wss.on("connection", ws => {

						const wsWorker = new WsWorker('-1', ws);
						wsListenerCommandFowardRequest(this, wsWorker);
						wsListenerCommandFowardToAllRequest(this, wsWorker);


						wsWorker.ws.on('message', msg => {


								let data = JSON.parse(msg.toString());


								if (data.type === "HANDSHAKE_DONE") {

										let id = data.message.ws_id;
										wsWorker.id = data.message.ws_id;

										
										if (id in this.clients) {
												try { this.clients[id].ws.close(); } catch(e:any) { logt(tag, `e:`, e.toString()); }
												delete this.clients[id];
										}


										logt(tag, `Connected:`, id);


										wsWorker.ws = ws;
										this.clients[id] = wsWorker;

								}


						});




						wsWorker.ws.on('pong', () => {
								wsWorker.ws.ping();
						});




						wsWorker.ws.on("close", () => {
								logt(tag, `Disconnected:`, wsWorker.id);
						});




				});
		}
}