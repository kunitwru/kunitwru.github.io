const socket = io('https://g2-rtc.herokuapp.com/');

socket.on('DANH_SACH_ONLINE', function (arrUserInfo) {
    $('#users-online').html('');
    arrUserInfo.map((item) => {
        var html = '<li class="call-action" id="'+ item.peerId +'">';
            html += '<span>' + item.user + '</span>'
            html += '</li>';
        $('#users-online').append(html);
    })
})

socket.on('DANG_KY_STATUS', function (status) {
    if (status) {
        $('#signup-era').hide();
        $('#chat-area').show();
    }
})

socket.on('DISCONNECT_ACTION', function (peerId) {
    $('#' + peerId).remove();
})

function openStream() {
    const config = {
        audio : false, video : true
    }
    return navigator.mediaDevices.getUserMedia(config)
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}


const peer = new Peer();
peer.on('open', id => {
    $('#signupForm').submit(function (e) {
        e.preventDefault();
        const username = $("#txtUsername").val();
        if (!username) {
            alert('Vui lòng nhập tên của bạn');
            return false;
        }
        $('#my-peer-id').append(username);
        socket.emit('NGUOI_DUNG_DANG_KY', {user : username, peerId : id});
    })

});

// caller
$('#users-online').on('click', 'li', function () {
    const id = $(this).attr('id');
    openStream()
        .then(stream => {
            playStream('localStream', stream);
            const call = peer.call(id, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream))
        })
})


//call

peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream)
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream))
        })
})

