class TestApp {
  constructor() {
    this.session = new SxmWeb.SxmSession();
    // let roomIdElement = document.getElementById("span-room-id");
    // let deviceIdElement = document.getElementById("span-device-id");
    // deviceIdElement.innerHTML = this.session.deviceId;
    // roomIdElement.innerHTML = this.session.roomId;
    this.startButton = document.getElementById("start-button");
    this.startButton.addEventListener("click", () => {
      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      console.log({ name, email });
      if (name === "") {
        alert("Please enter your name.");
        return;
      } else {
        if (!emailRegex.test(email)) {
          alert("Please enter a valid email address.");
          return;
        } else {
          this.initSXM({ name, email });
          this.updateUIForSession();
        }
      }
    });
  }

  updateUIForSession() {
    // Hide the app div and show the session message
    document.getElementById("app").style.display = "none";

    const messageDiv = document.createElement("div");
    messageDiv.id = "session-message";
    messageDiv.textContent = "Place your phone on the table";
    document.getElementById("content").appendChild(messageDiv);
  }

  initSXM(data) {
    if (this.sxmInitialized) return;
    this.sxmInitialized = true;
    this.session.start(200, data);
    console.log("working", data);
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
      } else {
        if (motionIcon.innerHTML != "smartphone")
          motionIcon.innerHTML = "smartphone";
      }
      let tiltIcon = document.getElementById("tiltIcon");
      tiltIcon.classList.add("show");
      if (tilted) {
        if (tiltIcon.innerHTML != "north_east")
          tiltIcon.innerHTML = "north_east";
      } else {
        if (tiltIcon.innerHTML != "horizontal_rule")
          tiltIcon.innerHTML = "horizontal_rule";
      }
    } else {
      if (motionIcon.innerHTML != "no_cell") motionIcon.innerHTML = "no_cell";
    }
  }
}
export { TestApp };
