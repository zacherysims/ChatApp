
$(function () {

    //Variables being initialized from the DOM, jquery-style
    let $messageArea = $('.messageArea');
    let $messageText = $('.messageText');
    let $userList = $('.userList');
    let $window = $(window);


    let username = false;
    let connected = false;
    let colour = '000000';

    let socket = io();

    socket.emit('add user');

    socket.on('welcome', (assignedUsername, messages) => {
        connected = true;
        username = assignedUsername;
        document.cookie = "username=" + assignedUsername;
        messages.forEach(element => addMessage(element));
    });

    socket.on('new message', (messages) => {
        $messageArea.empty();
        messages.forEach(element => addMessage(element));
    })

    socket.on('new user', (usernames) => {
        $userList.empty();
        usernames.forEach(element => addUser(element));
    })

    socket.on('user left', (usernames) => {
        $userList.empty();
        usernames.forEach(element => addUser(element));
    })

    socket.on('changed name', (usernames) => {
        $userList.empty();
        usernames.forEach(element => addUser(element));
    })

    const addUser = (addedUsername) => {
        let $usernameDiv = $('<span class="username">').text(addedUsername);
        if(username == addedUsername)
        {
            $usernameDiv = $('<span class="username">').text(addedUsername + ' (you)');
        }
        let $userDiv = $('<span class="user">').append($usernameDiv);
        $userList.append($userDiv);
    }

    const changeColour = (newColour) => {
        colour = newColour;
        socket.emit('changed colour', newColour);
    }

    const changeName = (newName) => {
        username = newName;
        document.cookie = "username=" + newName;
        socket.emit('changed name', newName);
    }

    const sendMessage = () => {
        let message = $messageText.val();

        if (message && connected) {
            $messageText.val('');
            if (message.split(" ")[0] == "/name") {
                changeName(message.substring(6));
            }
            else if(message.split(" ")[0] == "/colour") {
                changeColour(message.substring(8));
            }
            else {
                socket.emit('new message', message);
            }
        }
    }

    const addMessage = (data) => {
        let $timestampDiv = $('<span class="timestamp">').text(data.timestamp);
        let $usernameDiv = $('<span class="username">').text(data.username).css('color', '#' + data.colour);
        let $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);
        if (data.username == username) {
            $messageBodyDiv = $('<span class="messageBodySelf">')
                .text(data.message);
        }
        let $messageDiv = $('<li class="message">')
            .append($timestampDiv, $usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv);
    }

    const addMessageElement = (element) => {
        let $element = $(element);
        $messageArea.prepend($element);
    }

    $window.keydown(event => {
        if (event.which === 13) {
            sendMessage();
        }
    });
});