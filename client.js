"use strict";
const syncServerURL = "wss://nschnell.uber.space/sync/";
//const syncServerURL: string = "ws://localhost:8000/";
const daysElem = document.querySelector("#days");
const hoursElem = document.querySelector("#hours");
const minutesElem = document.querySelector("#minutes");
const secondsElem = document.querySelector("#seconds");
const millisecondsElem = document.querySelector("#milliseconds");
// create sync client
const clientSync = new ClientSync(syncServerURL);
function formatNumber(value, targetDigits) {
    const valueDigits = Math.floor(Math.log10(value)) + 1;
    let numZeros = 0;
    if (value === 0) {
        numZeros = targetDigits - 1;
    }
    else if (valueDigits < targetDigits) {
        numZeros = targetDigits - valueDigits;
    }
    return "0".repeat(numZeros) + value.toString();
}
setInterval(() => {
    if (clientSync.connected) {
        let milliseconds = Math.floor(1000 * clientSync.syncTime + 0.5);
        let seconds = Math.floor(clientSync.syncTime);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        milliseconds %= 1000;
        daysElem.innerHTML = days.toString();
        hoursElem.innerHTML = formatNumber(hours, 2);
        minutesElem.innerHTML = formatNumber(minutes, 2);
        secondsElem.innerHTML = formatNumber(seconds, 2);
        millisecondsElem.innerHTML = formatNumber(milliseconds, 3);
    }
}, 100);
//# sourceMappingURL=client.js.map