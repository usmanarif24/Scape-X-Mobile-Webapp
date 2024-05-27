class App {
    constructor(session) {
        this.session = session;
        this.session.registerCallback(this);
        this.displayName = "";
        this.appRoot = document.getElementById('app');
        this.startButton = document.getElementById('start-button');
        this.startButton.addEventListener("click", () => {
            this.initSXM();
        });
        if (this.getMobileOS() == 'iOS') {
            document.getElementById('splash').style.display = "block";
        }
        else {
            document.addEventListener("click", () => {
                this.initSXM();
            });
        }
    }
    getMobileOS() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) {
            return "Android";
        }
        else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return "iOS";
        }
        return "Other";
    }
    initSXM() {
        if (this.sxmInitialized)
            return;
        this.sxmInitialized = true;
        this.session.connect();
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
