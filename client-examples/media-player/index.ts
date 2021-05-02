namespace mediaPLayer {
  const syncServerURL: string = "wss://nschnell.uber.space/sync/";
  //const syncServerURL: string = "ws://localhost:8000/";

  // parameters
  const offset: number = 0;
  const level: number = 1;

  const maxSpeed: number = 1.5; // maximum video playback rate for timing adjustment
  const minSpeed: number = 1 / maxSpeed; // minimum video playback rate for timing adjustment
  const maxDelta: number = 0.200;

  // state
  let commonStartTime: number = 0; // not implemented yet
  let speed: number = 0;
  let lastAdjustTime: number = -Infinity;

  // get video element
  const videoElement: HTMLVideoElement = <HTMLVideoElement>document.getElementById("movie");

  // create sync client
  const clientSync: ClientSync = new ClientSync(syncServerURL);
  const adjustTimePeriod: number = 0.125; // period of timing correction process in secs

  videoElement.addEventListener("click", () => {
    if (speed === 0) {
      // start
      const time: number = clientSync.syncTime;
      const loopTime: number = (time - commonStartTime + offset) % videoElement.duration;

      videoElement.currentTime = loopTime;
      videoElement.play();

      speed = 1;
      requestAnimationFrame(adjustTimimg);
    } else {
      // stop
      videoElement.pause();
      speed = 0;
    }
  });

  function adjustTimimg(): void {
    if (speed > 0) {
      const time: number = clientSync.syncTime;

      if (time - lastAdjustTime > adjustTimePeriod) {
        const duration: number = videoElement.duration;
        const loopTime: number = (time - commonStartTime + offset) % duration;
        const videoTime: number = videoElement.currentTime;
        let delta: number = videoTime - loopTime;

        if (delta > maxDelta || delta < -maxDelta) {
          videoElement.currentTime = loopTime;
          videoElement.playbackRate = 1;
          speed = 1;
        } else {
          speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
          videoElement.playbackRate = speed;

          console.log(loopTime, videoTime, delta, speed);
        }

        lastAdjustTime = time;
      }

      requestAnimationFrame(adjustTimimg);
    }
  }

  function decibelToLinear(value: number) {
    return Math.exp(0.11512925464970229 * value);
  }
}
