# Clock Sync

This code is based on the [collective-soundworks](https://github.com/collective-soundworks) [clock synchronisation](https://github.com/collective-soundworks/sync).

This repository provides the following elements:
- a websocket-bases clock synchronisation server (sync-server.js)
- a client-side class `ClientSync` connecting to the clock synchronisation server (sync-client.js)
- a set of basic client-side examples (client-examples/)
 - [display/](client-examples/display): displays the sync clock time on a simple HTML page
 - [media-player/](client-examples/media-player): plays a movie in a loop according to the sync-time
 