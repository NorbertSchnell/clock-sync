"use strict";
var audioPlayer;
(function (audioPlayer) {
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
    // get audio element
    const audioElement = document.getElementById("audio");
    let audioDuration = 0;
    // create sync client
    const clientSync = new ClientSync(syncServerURL);
    const adjustTimePeriod = 0.5; // period of timing correction process in secs
    audioElement.addEventListener("play", () => {
        audioDuration = 0.01 * Math.floor(100 * audioElement.duration); // round to centiseconds
        // start
        const time = clientSync.syncTime;
        const targetTime = (time - commonStartTime + offset) % audioDuration;
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
    function adjustTimimg() {
        if (speed > 0) {
            const time = clientSync.syncTime;
            if (time - lastAdjustTime > adjustTimePeriod) {
                const targetTime = (time - commonStartTime + offset) % audioDuration;
                const audioTime = audioElement.currentTime;
                let delta = audioTime - targetTime;
                if (delta > maxDelta || delta < -maxDelta) {
                    audioElement.currentTime = targetTime;
                    audioElement.playbackRate = 1;
                    audioElement.play();
                    speed = 1;
                    // console.log("jumping:", time, targetTime, audioTime, delta, speed);
                }
                else {
                    speed = Math.max(minSpeed, Math.min(maxSpeed, (adjustTimePeriod - delta) / adjustTimePeriod));
                    audioElement.playbackRate = speed;
                    // console.log("adjusting speed:", time, targetTime, audioTime, delta, speed);
                }
                requestAnimationFrame(adjustTimimg);
            }
        }
    }
})(audioPlayer || (audioPlayer = {}));
//# sourceMappingURL=audio-only.js.map