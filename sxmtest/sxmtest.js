import { Capore } from "../capore/capore.js";
import { App } from "./js/app.js";
function startApp() {
    let capore = new Capore();
    let app = new App(capore);
    let roomIdElement = document.getElementById("span-room-id");
    roomIdElement.innerHTML = capore.room_uuid;
}
startApp();
