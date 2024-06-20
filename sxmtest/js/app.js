class App {
    constructor() {
        this.session = new SxmWeb.SxmSession();
        let roomIdElement = document.getElementById("span-room-id");
        roomIdElement.innerHTML = this.session.roomId;
        this.displayName = "";
        this.appRoot = document.getElementById('app');
        this.startButton = document.getElementById('start-button');
        this.startButton.addEventListener("click", () => {
            this.initSXM();
        });
    }

    initSXM() {
        if (this.sxmInitialized)
            return;
        this.sxmInitialized = true;
        this.session.start();
        setInterval(() => {
            let moving = this.session.device.isMoving();
            let tilted = this.session.device.isTilted();
            let sensorIcon = document.getElementById("sensorIcon");
            sensorIcon.classList.add("show");
            if (this.session.device.joined) {
                if (moving) {
                    if (sensorIcon.innerHTML != "vibration")
                        sensorIcon.innerHTML = "vibration";
                }
                else {
                    if (sensorIcon.innerHTML != "smartphone")
                        sensorIcon.innerHTML = "smartphone";
                }
                let sensorIcon2 = document.getElementById("sensorIcon2");
                sensorIcon2.classList.add("show");
                if (tilted) {
                    if (sensorIcon2.innerHTML != "north_east")
                        sensorIcon2.innerHTML = "north_east";
                }
                else {
                    if (sensorIcon2.innerHTML != "horizontal_rule")
                        sensorIcon2.innerHTML = "horizontal_rule";
                }
            }
            else {
                if (sensorIcon.innerHTML != "no_cell")
                    sensorIcon.innerHTML = "no_cell";
            }
        }, 250);
    }
    onStart(message) {
    }
    onShutdown(message) {
    }
    onDown(message) {
    }
    onUp(message) {
    }
}
export { App };
