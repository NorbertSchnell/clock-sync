"use strict";
var mediaPLayer;
(function (mediaPLayer) {
    const syncServerURL = "wss://nschnell.uber.space/sync/";
    //const syncServerURL: string = "ws://localhost:8000/";
    // parameters
    const offset = 0;
    const level = 1;
    const maxSpeed = 1.5; // maximum video playback rate for timing adjustment
    const minSpeed = 1 / maxSpeed; // minimum video playback rate for timing adjustment
    const maxDelta = 0.200;
    // state
    let commonStartTime = 0; // not implemented yet
    let speed = 0;
    let lastAdjustTime = -Infinity;
    // get video element
    const videoElement = document.getElementById("movie");
    // create sync client
    const clientSync = new ClientSync(syncServerURL);
    const adjustTimePeriod = 0.125; // period of timing correction process in secs
    videoElement.addEventListener("click", () => {
        if (speed === 0) {
            // start
            const time = clientSync.syncTime;
            const loopTime = (time - commonStartTime + offset) % videoElement.duration;
            videoElement.currentTime = loopTime;
            videoElement.play();
            speed = 1;
            requestAnimationFrame(adjustTimimg);
        }
        else {
            // stop
            videoElement.pause();
            speed = 0;
        }
    });
    function adjustTimimg() {
        if (speed > 0) {
            const time = clientSync.syncTime;
            if (time - lastAdjustTime > adjustTimePeriod) {
                const duration = videoElement.duration;
                const loopTime = (time - commonStartTime + offset) % duration;
                const videoTime = videoElement.currentTime;
                let delta = videoTime - loopTime;
                if (delta > maxDelta || delta < -maxDelta) {
                    videoElement.currentTime = loopTime;
                    videoElement.playbackRate = 1;
                    speed = 1;
                }
                else {
                    speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
                    videoElement.playbackRate = speed;
                    console.log(loopTime, videoTime, delta, speed);
                }
                lastAdjustTime = time;
            }
            requestAnimationFrame(adjustTimimg);
        }
    }
    function decibelToLinear(value) {
        return Math.exp(0.11512925464970229 * value);
    }
})(mediaPLayer || (mediaPLayer = {}));
//# sourceMappingURL=index.js.map