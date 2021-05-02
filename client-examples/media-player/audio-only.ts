namespace audioPlayer {
  const syncServerURL: string = "wss://nschnell.uber.space/sync/";
  //const syncServerURL: string = "ws://localhost:8000/";

  // parameters
  const offset: number = 0;

  const maxSpeed: number = 2; // maximum playback rate for timing adjustment
  const minSpeed: number = 1 / maxSpeed; // minimum playback rate for timing adjustment
  const maxDelta: number = 0.500;

  // state
  let commonStartTime: number = 0; // not implemented yet
  let lastAdjustTime: number = 0;
  let speed: number = 0;

  // get audio element
  const audioElement: HTMLAudioElement = <HTMLAudioElement>document.getElementById("audio");
  let audioDuration: number = 0;

  // create sync client
  const clientSync: ClientSync = new ClientSync(syncServerURL);
  const adjustTimePeriod: number = 0.5; // period of timing correction process in secs

  audioElement.addEventListener("play", () => {
    audioDuration = 0.01 * Math.floor(100 * audioElement.duration); // round to centiseconds

    // start
    const time: number = clientSync.syncTime;
    const targetTime: number = (time - commonStartTime + offset) % audioDuration;

    audioElement.currentTime = targetTime;
    audioElement.playbackRate = 1;
    audioElement.play();
    speed = 1;
    // console.log("starting:", time, targetTime, audioDuration);

    requestAnimationFrame(adjustTimimg);
  });

  audioElement.addEventListener("pause", () => {
    speed = 0;
  });

  function adjustTimimg(): void {
    if (speed > 0) {
      const time: number = clientSync.syncTime;

      if (time - lastAdjustTime > adjustTimePeriod) {
        const targetTime: number = (time - commonStartTime + offset) % audioDuration;
        const audioTime: number = audioElement.currentTime;
        let delta: number = audioTime - targetTime;

        if (delta > maxDelta || delta < -maxDelta) {
          audioElement.currentTime = targetTime;
          audioElement.playbackRate = 1;
          audioElement.play();
          speed = 1;
          // console.log("jumping:", time, targetTime, audioTime, delta, speed);
        } else {
          speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
          audioElement.playbackRate = speed;
          // console.log("adjusting speed:", time, targetTime, audioTime, delta, speed);
        }

        requestAnimationFrame(adjustTimimg);
      }
    }
  }
}
