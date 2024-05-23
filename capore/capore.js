import { Device } from './device.js';
import { NoSleep } from './no_sleep.js';
import { MqttClient } from './mqtt_client.js';
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
class Capore {
    constructor(room_uuid) {
        this.uuid = localStorage.getItem("device_uuid");
        if (this.uuid === null) {
            this.uuid = uuidv4();
            localStorage.setItem("device_uuid", this.uuid);
        }
        this.device = new Device();
        this.device.registerOnMotionChanged(() => this.sendStatus());
        var urlString = window.location.search.substring(1);
        var urlVars = urlString.split('&');
        this.scape_x_server_url = null;
        this.room_uuid = (!!room_uuid) ? room_uuid : "room_uuid";
        this.scape_x_server_url = "wss://broker.hivemq.com/mqtt:8884";
        urlVars.forEach(param => {
            var [key, value] = decodeURI(param).split("=");
            switch (key) {
                case "u":
                    let url = decodeURIComponent(value);
                    if (url != "")
                        this.scape_x_server_url = url;
                    break;
                case "r":
                    this.room_uuid = decodeURIComponent(value);
                    break;
                case "device_uuid":
                    this.uuid = decodeURIComponent(value);
                    break;
            }
        });
        this.capore_id = this.room_uuid;
        if (!this.scape_x_server_url.endsWith("/")) {
            this.scape_x_server_url += "/";
        }
        if (!this.scape_x_server_url.startsWith("wss")) {
            this.scape_x_server_url = "wss://" + this.scape_x_server_url;
        }
        this.client = new MqttClient(this.scape_x_server_url, this.uuid + "_capore");
        const heartbeatIntervalMilliseconds = 200;
        this.statusIntervalId = window.setInterval(() => this.sendStatus(), heartbeatIntervalMilliseconds);
        this.noSleep = new NoSleep();
        this.isNoSleep = false;
        this.isDeviceOrientationPermission = false;
        this.subscribe("/sxm/" + this.room_uuid + "/start", (message) => this.onStart(message));
        this.subscribe("/sxm/" + this.room_uuid + "/shutdown", (message) => this.onShutdown(message));
        this.subscribe("/sxm/" + this.room_uuid + "/" + this.uuid + "/down", (message) => this.onDown(message));
        this.subscribe("/sxm/" + this.room_uuid + "/" + this.uuid + "/up", (message) => this.onUp(message));
    }
    registerCallback(callback) {
        this.callback = callback;
    }
    connect() {
        if (!this.isDeviceOrientationPermission) {
            console.log("request device orientation permission");
            this.device.requestPermission();
            this.isDeviceOrientationPermission = true;
        }
        if (!this.isNoSleep) {
            console.log("no sleep");
            this.noSleep.enable();
            this.isNoSleep = true;
        }
    }
    disconnect() {
        clearInterval(this.statusIntervalId);
    }
    subscribe(topic, on_message) {
        this.client.subscribe(topic, on_message);
    }
    send(topic, message) {
        this.client.send(topic, message, 0, false);
    }
    sendStatus() {
        let value = JSON.stringify({ device_id: this.uuid, device_movement: this.device.isMoving() ? "moving" : "stationary", device_tilt: this.device.isTilted() ? "tilted" : "horizontal" });
        this.client.send(this.capore_id + "/box", value, 1, false);
    }
    onStart(message) {
        if (this.callback)
            this.callback.onStart();
    }
    onShutdown(message) {
        if (this.callback)
            this.callback.onShutdown();
    }
    onDown(message) {
        if (this.callback)
            this.callback.onDown();
    }
    onUp(message) {
        if (this.callback)
            this.callback.onUp();
    }
}
export { Capore };
