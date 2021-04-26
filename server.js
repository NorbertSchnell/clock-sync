"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws = require("ws");
const server_1 = require("@ircam/sync/server");
const port = Number(process.env.PORT) || 8000;
/**
 * Configure and start the `websocket` and `sync` servers
 *
 * user-defined protocol:
 * => 0: ping
 * => 1: pong
 */
const startTime = process.hrtime();
const getTimeFunction = () => {
    const now = process.hrtime(startTime);
    return now[0] + now[1] * 1e-9;
};
const wss = new ws.Server({ port: port });
const syncServer = new server_1.default(getTimeFunction);
wss.on("connection", (socket) => {
    const receiveFunction = (callback) => {
        socket.on("message", (data) => {
            const bytes = new Uint8Array(data);
            const request = new Float64Array(bytes.buffer);
            if (request[0] === 0) { // this is a ping
                const pingId = request[1];
                const clientPingTime = request[2];
                // console.log(`[ping] - pingId: %s, clientPingTime: %s`, pingId, clientPingTime);
                callback(pingId, clientPingTime);
            }
        });
    };
    const sendFunction = (pingId, clientPingTime, serverPingTime, serverPongTime) => {
        // console.log(`[pong] - id: %s, clientPingTime: %s, serverPingTime: %s, serverPongTime: %s`, pingId, clientPingTime, serverPingTime, serverPongTime);
        const response = new Float64Array(5);
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
//# sourceMappingURL=server.js.map