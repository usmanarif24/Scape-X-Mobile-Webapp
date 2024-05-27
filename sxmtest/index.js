function init() {
    let roomInput = document.getElementById('room_id_input');
    window.location.href = `sxmtest.html?r=${roomInput.value}`;
}

