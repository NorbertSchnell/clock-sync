namespace display {
  const syncServerURL: string = "wss://nschnell.uber.space/sync/";
  //const syncServerURL: string = "ws://localhost:8000/";

  const daysElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#days");
  const hoursElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#hours");
  const minutesElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#minutes");
  const secondsElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#seconds");
  const millisecondsElem: HTMLSpanElement = <HTMLSpanElement>document.querySelector("#milliseconds");

  // create sync client
  const clientSync: ClientSync = new ClientSync(syncServerURL);

  function formatNumber(value: number, targetDigits: number): string {
    const valueDigits: number = Math.floor(Math.log10(value)) + 1;
    let numZeros: number = 0;

    if (value === 0) {
      numZeros = targetDigits - 1;
    } else if (valueDigits < targetDigits) {
      numZeros = targetDigits - valueDigits;
    }

    return "0".repeat(numZeros) + value.toString();
  }

  setInterval(() => {
    if (clientSync.connected) {
      let milliseconds: number = Math.floor(1000 * clientSync.syncTime + 0.5);
      let seconds: number = Math.floor(clientSync.syncTime);
      let minutes: number = Math.floor(seconds / 60);
      let hours: number = Math.floor(minutes / 60);
      let days: number = Math.floor(hours / 24);

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
  }, 57);
}
