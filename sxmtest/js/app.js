class App {
    constructor() {
        this.session = new SxmWeb.SxmSession();
        let roomIdElement = document.getElementById("span-room-id");
        roomIdElement.innerHTML = this.session.roomId;
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
            this.updateMotionIcons();
        }, 250);
    }

    updateMotionIcons() {
        let moving = this.session.device.isMoving;
        let tilted = this.session.device.isTilted;
        let motionIcon = document.getElementById("motionIcon");
        motionIcon.classList.add("show");
        if (this.session.device.joined) {
            if (moving) {
                if (motionIcon.innerHTML != "vibration")
                    motionIcon.innerHTML = "vibration";
            }
            else {
                if (motionIcon.innerHTML != "smartphone")
                    motionIcon.innerHTML = "smartphone";
            }
            let tiltIcon = document.getElementById("tiltIcon");
            tiltIcon.classList.add("show");
            if (tilted) {
                if (tiltIcon.innerHTML != "north_east")
                    tiltIcon.innerHTML = "north_east";
            }
            else {
                if (tiltIcon.innerHTML != "horizontal_rule")
                    tiltIcon.innerHTML = "horizontal_rule";
            }
        }
        else {
            if (motionIcon.innerHTML != "no_cell")
                motionIcon.innerHTML = "no_cell";
        }
    }
}
export { App };
