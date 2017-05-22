var socket;
$(document).ready(function () {
    encode('Hello World!');
    // console.log(encode('Hello World!'));
    // $("#chat").hide();
});
function add_message(message, left_or_right) {
    socket.emit('chat message', {'username': name, 'msgcontent': message});
    var content = $(".messages");
    content.append('<li class="message  ' + left_or_right + ' appeared">' +
        '<div class="avatar"><div class="avatar_name">' + name + '</div></div><div class="text_wrapper">' +
        '<div class="text">' + message + '</div></div></li>');
    $('.messages').animate({scrollTop: $('.messages').prop('scrollHeight')}, 300);
}

function send_message() {
    var message = $("#message_text").val().trim();
    if (message === '') {
        return;
    }
        add_message(message, 'right');
        
        // socket.emit('chat message', message);
        $("#message_text").val('');
}
function check_keyboard() {
    var keycode = event.keyCode;
    if (keycode == 13)
        if (event.shiftKey)
            send_message();
        else
            send_message();
}

function start_chat()
{
    $("#chat").show();
    name = $("#my_name").val();
    $("#my_name").attr("disabled", true);
    socket = io.connect();
    socket.on('chat message', function (msg) {
        if (msg.msgcontent)
        {
            if (msg.msgcontent.trim() === '')
            {
                return;
            }
            else
            {
                var content = $(".messages");
                content.append('<li class="message  ' + 'left' + ' appeared">' +
                '<div class="avatar"><div class="avatar_name">' + msg.username + '</div></div><div class="text_wrapper">' +
                '<div class="text">' + msg.msgcontent + '</div></div></li>');
                console.log(msg);
                $('.messages').animate({scrollTop: $('.messages').prop('scrollHeight')}, 300);
            }
        }
    });
}

function encode(str)
{
    var length = str.length,
    output = [];
    for (var i = 0;i < length; i++) {
        var bin = str[i].charCodeAt().toString(2);
        output.push(Array(8-bin.length+1).join("0") + bin);
    }
    var binary = output.join('');
    console.log(output.join(''));
    return output.join(" ");
}