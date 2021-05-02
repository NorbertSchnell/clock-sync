import * as ws from "ws";
import SyncServer from "@ircam/sync/server";

type ReceiveFunction = (pingId: number, clientPingTime: number) => void;
type SendFunction = (pingId: number, clientPingTime: number, serverPingTime: number, serverPongTime: number) => void;

const port: number = Number(process.env.PORT) || 8000;

/**
 * Configure and start the `websocket` and `sync` servers
 *
 * user-defined protocol:
 * => 0: ping
 * => 1: pong
 */
const startTime: [number, number] = process.hrtime();

const getTimeFunction: Function = () => {
  const now: [number, number] = process.hrtime(startTime);
  return now[0] + now[1] * 1e-9;
};

const wss: ws.Server = new ws.Server({ port: port });
const syncServer: SyncServer = new SyncServer(getTimeFunction);

wss.on("connection", (socket) => {
  const receiveFunction: Function = (callback: ReceiveFunction) => {
    socket.on("message", (data) => {
      const bytes: Uint8Array = new Uint8Array(<ArrayBuffer>data);
      const request: Float64Array = new Float64Array(bytes.buffer);

      if (request[0] === 0) { // this is a ping
        const pingId: number = request[1];
        const clientPingTime: number = request[2];

        // console.log(`[ping] - pingId: %s, clientPingTime: %s`, pingId, clientPingTime);

        callback(pingId, clientPingTime);
      }
    });
  };

  const sendFunction: SendFunction = (pingId, clientPingTime, serverPingTime, serverPongTime) => {
    // console.log(`[pong] - id: %s, clientPingTime: %s, serverPingTime: %s, serverPongTime: %s`, pingId, clientPingTime, serverPingTime, serverPongTime);

    const response: Float64Array = new Float64Array(5);
    response[0] = 1; // this is a pong
    response[1] = pingId;
    response[2] = clientPingTime;
    response[3] = serverPingTime;
    response[4] = serverPongTime;

    // create a node Buffer without copy (shared memory)
    socket.send(response.buffer);
  };

  syncServer.start(sendFunction, receiveFunction);
});
