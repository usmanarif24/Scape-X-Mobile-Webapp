import { SxmSession } from "../sxm/session.js";
import { App } from "./js/app.js";
function startApp() {
    let session = new SxmSession();
    let app = new App(session);
    let roomIdElement = document.getElementById("span-room-id");
    roomIdElement.innerHTML = session.room_uuid;
}
startApp();
