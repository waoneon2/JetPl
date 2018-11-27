(function ( $ ) {
	"use strict";
	var $chatWindow = $('#jchat_messages');
    var chatClient;
    var generalChannel;
    var username;
    var dateVal;
    var titleDateVal;
    var $urlImgProfile;
    var allUser = [];

    function formatDate(date) {
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }


    function jchatPrint(infoMessage, asHtml) {
        var $msg = $('<div class="jchat_info">');
        if (asHtml) {
            $msg.html(infoMessage);
        } else {
            $msg.text(infoMessage);
        }
        $chatWindow.append($msg);
    }

    function jchatPrintMessage(fromUser, message, chatDatetime, imgProfile) {
        var onDate = new Date(chatDatetime);
        titleDateVal = formatDate(onDate);
        var $user = $('<span class="jchat_username">').text(fromUser + '');
        var $datetime = $('<span class="jchat_datetime" title="'+titleDateVal+'">').text(chatDatetime);
        var $userImg = $('<span class="jchat_imgprofile">').html('<img src="'+imgProfile+'"/>');
        var $message = $('<span class="jchat_message">').text(message);
        var $container = $('<div class="jchat_message-container">');

        //console.log(fromUser);
        if (fromUser === username) {
            $container.addClass('jchat_me');
        }
        
        $container.append($user).append($datetime).append($message);
        $chatWindow.append($container);
        $chatWindow.scrollTop($chatWindow[0].scrollHeight);
    }

    function processPage(page) {
        page.items.forEach(message => {
            dateVal = new Date(message.timestamp);
            jchatPrintMessage(message.author, message.body, dateVal.toLocaleString(), $urlImgProfile);
            
        });
        if (page.hasNextPage) {
            page.nextPage().then(processPage);
        } else {
            console.log("all messages read!");
        }
    }

    function createOrJoinGeneralChannel() {
        jchatPrint('Attempting to join "jettygeneralchatroom" chat channel...');
        var promise = chatClient.getChannelByUniqueName('jettygeneralchatroom');
        promise.then(function(channel) {
            generalChannel = channel;
            generalChannel.getMessages(30, 0, 'forward').then(processPage).catch(function(e){
                setTimeout(function(){
                    location.reload();
                }, 1000);
            });
            setupChannel();
        }).catch(function(e) {
            // If it doesn't exist, let's create it
            chatClient.createChannel({
                uniqueName: 'jettygeneralchatroom',
                friendlyName: 'General Chat Channel for Jetty'
            }).then(function(channel) {
                generalChannel = channel;
                setupChannel();
            });
        });
    }

    function setupChannel() {
        generalChannel.join().then(function(channel) {
            jchatPrint('Joined channel as ' 
                + '<span class="jchat_me">' + username + '</span>.', true);
        });

        generalChannel.on('messageAdded', function(message) {
            dateVal = new Date(message.timestamp);
            jchatPrintMessage(message.author, message.body, dateVal.toLocaleString(), $urlImgProfile);
        });
    }

	$.ajax({
		url : jchat_ajax_action.ajax_url,
		type : 'post',
		data : {
			action : 'jchat_handle_ajax_req',
			device : 'browser'
		},
		beforeSend : function(){
			
		},
		success : function( response ) {
			username = response.identity;
            $urlImgProfile = response.userAvatarUrl;
			jchatPrint('You have been assigned a username of: ' 
            + '<span class="jchat_me">' + username + '</span>', true);

        	chatClient = new Twilio.Chat.Client(response.token);
        	chatClient.getSubscribedChannels().then(createOrJoinGeneralChannel);
		}
	});

    var $input = $('#chat-input');
    $input.on('keydown', function(e) {
        if (e.keyCode == 13) {
            if($.trim( $input.val() ) === ''){
                console.log("empty");
                $input.val('');
            } else {
                generalChannel.sendMessage($input.val())
                $input.val(''); 
            }
        }
    });

}(jQuery));