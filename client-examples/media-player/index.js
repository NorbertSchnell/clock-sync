"use strict";
var videoPlayer;
(function (videoPlayer) {
    const syncServerURL = "wss://nschnell.uber.space/sync/";
    //const syncServerURL: string = "ws://localhost:8000/";
    // parameters
    const offset = 0;
    const maxSpeed = 2; // maximum playback rate for timing adjustment
    const minSpeed = 1 / maxSpeed; // minimum playback rate for timing adjustment
    const maxDelta = 0.500;
    // state
    let commonStartTime = 0; // not implemented yet
    let lastAdjustTime = 0;
    let speed = 0;
    // get video element
    const videoElement = document.getElementById("video");
    let videoDuration = 0;
    // create sync client
    const clientSync = new ClientSync(syncServerURL);
    const adjustTimePeriod = 0.5; // period of timing correction process in secs
    videoElement.addEventListener("play", () => {
        videoDuration = 0.01 * Math.floor(100 * videoElement.duration); // round to centiseconds;
        // start
        const time = clientSync.syncTime;
        const targetTime = (time - commonStartTime + offset) % videoDuration;
        videoElement.currentTime = targetTime;
        videoElement.playbackRate = 1;
        videoElement.play();
        speed = 1;
        // console.log("starting:", time, targetTime, videoDuration);
        requestAnimationFrame(adjustTimimg);
    });
    videoElement.addEventListener("pause", () => {
        speed = 0;
    });
    function adjustTimimg() {
        if (speed > 0) {
            const time = clientSync.syncTime;
            if (time - lastAdjustTime > adjustTimePeriod) {
                const targetTime = (time - commonStartTime + offset) % videoDuration;
                const videoTime = videoElement.currentTime;
                let delta = videoTime - targetTime;
                if (delta > maxDelta || delta < -maxDelta) {
                    videoElement.currentTime = targetTime;
                    videoElement.playbackRate = 1;
                    videoElement.play();
                    speed = 1;
                    // console.log("jumping:", time, targetTime, videoTime, delta, speed);
                }
                else {
                    speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
                    videoElement.playbackRate = speed;
                    // console.log("adjusting speed:", time, targetTime, videoTime, delta, speed);
                }
                requestAnimationFrame(adjustTimimg);
            }
            lastAdjustTime = time;
        }
    }
})(videoPlayer || (videoPlayer = {}));
//# sourceMappingURL=index.js.map