"use strict";
//const url: string = "wss://sync.herokuapp.com/";
const url = "ws://localhost:8000/";
const daysElem = document.querySelector("#days");
const hoursElem = document.querySelector("#hours");
const minutesElem = document.querySelector("#minutes");
const secondsElem = document.querySelector("#seconds");
const millisecondsElem = document.querySelector("#milliseconds");
const statusContainer = document.querySelector("#connection-status");
let connected = false;
const getTimeFunction = () => {
    return performance.now() / 1000;
};
// init socket client
const socket = new WebSocket(url);
socket.binaryType = "arraybuffer";
// init sync client
const syncClient = new SyncClient(getTimeFunction);
setInterval(() => {
    if (connected) {
        const syncTime = syncClient.getSyncTime();
        const seconds = Math.floor(syncTime);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const milliseconds = Math.floor(1000 * syncTime + 0.5);
        daysElem.innerHTML = `day ${days}, `;
        hoursElem.innerHTML = `${hours % 24}:`;
        minutesElem.innerHTML = `${minutes % 60}:`;
        secondsElem.innerHTML = `${seconds % 60}`;
        millisecondsElem.innerHTML = `.${milliseconds % 1000}`;
    }
}, 100);
socket.addEventListener("open", () => {
    const sendFunction = (pingId, clientPingTime) => {
        const request = new Float64Array(3);
        request[0] = 0; // this is a ping
        request[1] = pingId;
        request[2] = clientPingTime;
        // console.log(`[ping] - id: %s, pingTime: %s`, request[1], request[2]);
        socket.send(request.buffer);
    };
    const receiveFunction = (callback) => {
        socket.addEventListener("message", e => {
            const response = new Float64Array(e.data);
            if (response[0] === 1) { // this is a pong
                const pingId = response[1];
                const clientPingTime = response[2];
                const serverPingTime = response[3];
                const serverPongTime = response[4];
                // console.log(`[pong] - id: %s, clientPingTime: %s, serverPingTime: %s, serverPongTime: %s`, pingId, clientPingTime, serverPingTime, serverPongTime);
                callback(pingId, clientPingTime, serverPingTime, serverPongTime);
            }
        });
    };
    const statusFunction = (status) => {
        connected = (status.connection == "online");
        // statusContainer.innerHTML = JSON.stringify(status, null, 2);
        // console.log(status);
    };
    syncClient.start(sendFunction, receiveFunction, statusFunction);
});
socket.addEventListener("error", (err) => console.error(err));
socket.addEventListener("close", () => console.log("socket closed"));
//# sourceMappingURL=client.js.map