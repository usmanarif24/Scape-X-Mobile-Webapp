function init() {
    let startButton = document.getElementById('start-button');
    startButton.addEventListener("click", () => {
        let roomInput = document.getElementById('room_id_input');
        open(`sxmtest.html?r=${roomInput.value}`);
    });
}
init();
export {};
