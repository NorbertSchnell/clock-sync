namespace videoPlayer {
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

  // get video element
  const videoElement: HTMLVideoElement = <HTMLVideoElement>document.getElementById("video");
  let videoDuration: number = 0;

  // create sync client
  const clientSync: ClientSync = new ClientSync(syncServerURL);
  const adjustTimePeriod: number = 0.5; // period of timing correction process in secs

  videoElement.addEventListener("play", () => {
    videoDuration = 0.01 * Math.floor(100 * videoElement.duration); // round to centiseconds;

    // start
    const time: number = clientSync.syncTime;
    const targetTime: number = (time - commonStartTime + offset) % videoDuration;

    videoElement.currentTime = targetTime;
    videoElement.play();
    videoElement.playbackRate = 1;
    speed = 1;
    // console.log("starting:", time, targetTime, videoDuration);

    requestAnimationFrame(adjustTimimg);
  });

  videoElement.addEventListener("pause", () => {
    speed = 0;
  });

  function adjustTimimg(): void {
    if (speed > 0) {
      const time: number = clientSync.syncTime;

      if (time - lastAdjustTime > adjustTimePeriod) {
        const targetTime: number = (time - commonStartTime + offset) % videoDuration;
        const videoTime: number = videoElement.currentTime;
        let delta: number = videoTime - targetTime;

        if (delta > maxDelta || delta < -maxDelta) {
          videoElement.currentTime = targetTime;
          videoElement.play();
          videoElement.playbackRate = 1;
          speed = 1;
          // console.log("jumping:", time, targetTime, videoTime, delta, speed);
        } else {
          speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
          videoElement.playbackRate = speed;
          // console.log("adjusting speed:", time, targetTime, videoTime, delta, speed);
        }

        lastAdjustTime = time;
      }

      requestAnimationFrame(adjustTimimg);
    }
  }
}
