//const url: string = "wss://sync.herokuapp.com/";
const url: string = "ws://localhost:8000/";

const daysElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#days");
const hoursElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#hours");
const minutesElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#minutes");
const secondsElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#seconds");
const millisecondsElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#milliseconds");
const statusContainer: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#connection-status");
let connected: boolean = false;

const getTimeFunction: GetTimeFunction = () => {
  return performance.now() / 1000;
};

// init socket client
const socket: WebSocket = new WebSocket(url);
socket.binaryType = "arraybuffer";

// init sync client
const syncClient: SyncClient = new SyncClient(getTimeFunction);

setInterval(() => {
  if (connected) {
    const syncTime: number = syncClient.getSyncTime();
    const seconds: number = Math.floor(syncTime);
    const minutes: number = Math.floor(seconds / 60);
    const hours: number = Math.floor(minutes / 60);
    const days: number = Math.floor(hours / 24);
    const milliseconds: number = Math.floor(1000 * syncTime + 0.5);

    daysElem.innerHTML = `day ${days}, `;
    hoursElem.innerHTML = `${hours % 24}:`;
    minutesElem.innerHTML = `${minutes % 60}:`;
    secondsElem.innerHTML = `${seconds % 60}`;
    millisecondsElem.innerHTML = `.${milliseconds % 1000}`;
  }
}, 100);

socket.addEventListener("open", () => {
  const sendFunction: SendFunction = (pingId, clientPingTime) => {
    const request: Float64Array = new Float64Array(3);
    request[0] = 0; // this is a ping
    request[1] = pingId;
    request[2] = clientPingTime;

    // console.log(`[ping] - id: %s, pingTime: %s`, request[1], request[2]);

    socket.send(request.buffer);
  };

  const receiveFunction: ReceiveFunction = (callback) => {
    socket.addEventListener("message", e => {
      const response: Float64Array = new Float64Array(e.data);

      if (response[0] === 1) { // this is a pong
        const pingId: number = response[1];
        const clientPingTime: number = response[2];
        const serverPingTime: number = response[3];
        const serverPongTime: number = response[4];

        // console.log(`[pong] - id: %s, clientPingTime: %s, serverPingTime: %s, serverPongTime: %s`, pingId, clientPingTime, serverPingTime, serverPongTime);

        callback(pingId, clientPingTime, serverPingTime, serverPongTime);
      }
    });
  };

  const statusFunction: StatusFunction = (status) => {
    connected = (status.connection == "online");

    // statusContainer.innerHTML = JSON.stringify(status, null, 2);
    // console.log(status);
  };

  syncClient.start(sendFunction, receiveFunction, statusFunction);
});

socket.addEventListener("error", (err) => console.error(err));
socket.addEventListener("close", () => console.log("socket closed"));
