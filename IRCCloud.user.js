// ==UserScript==
// @name    Hailstorm
// @version 2011-3-17_1
// @author  Daniel Jennings (sekkusu@gmail.com)
// @license MIT
//
// @require https://irccloud.com/static/js/dep/jquery-1.5.1.min.js
// @match   https://irccloud.com/*
// ==/UserScript==

function HS_main ($) {

    // Event Handlers
    var onChatMessage = function ($message) {
        var $author = $message.find('span.author');

        // CRC variant
        var hashFunction = function (name) {
            var hash = 1631458281; // Random number
            for (var i = 0; i < name.length; i++) {
                var hi = hash & 4160749568;
                hash = hash << 5;
                hash = hash ^ (hi >> 27);
                hash = hash ^ name.charCodeAt(i);
            }
            return hash;
        }
        
        var $authorAnchor = $author.find('a');
        var name = $authorAnchor.text()
        var nameHash = hashFunction(name);
        var hue = nameHash % 360;
        
        var color = 'hsl(' + hue + ',100%,40%)';
        
        $author.css('color', color);
        $authorAnchor.css('color', color);
    };
    
    // Run startup changes
    $('head').append($('<style> * { font-family: "Consolas" !important; font-size: 10pt !important } </style>'));
        
    // Register for chat messages
    $('#buffer').bind('DOMNodeInserted', function (event) {
        var $target = $(event.target);
        if ($target.is('div.chat'))
            return onChatMessage($target);
    });
    
    // Register the context menu
    $('#buffer').delegate('div.type_buffer_msg span.author a.buffer', 'contextmenu', function (event) {
        event.preventDefault();
    
        var username = $(event.target).text();
        var clickedUserData = $(event.target).closest('div').data('view');

        var channelBuffer = null;
        
        var memberListSamples = $(".memberList li.user [href$='" + encodeURIComponent(username.toLowerCase()) + "']").closest('li.user');
        for (var i = 0; i < memberListSamples.length; i++) {
            var memberListSample = memberListSamples[i];
            var sampleData = $(memberListSample).data('view').channelView.buffer;
            if (sampleData.bid == clickedUserData.buffer.bid) {
                channelBuffer = sampleData;
                break;
            }
        }
        
        if (!channelBuffer) {
            console.log('Channel not found for user: ' + username);
            return;
        }
        
        window.controller['say'](channelBuffer.cid, channelBuffer.name, 'Hello, ' + username + '!');
        console.log(username + ' clicked in channel: ' + channelBuffer.name + ' (ID ' + channelBuffer.bid + ')');
    });
}

function HS_busyloop (fn) {
    if (typeof window.jQuery == 'undefined') {
        window.setTimeout(function() { HS_busyloop(fn) }, 100);
    }
    else {
        fn(window.jQuery);
    }
};

function HS_inject (fn) {
    var script = document.createElement('script');
    script.textContent = fn.toString();
    script.textContent += ';\n(' + HS_busyloop.toString() + ')(' + fn.name + ');';
    document.body.appendChild(script);
}

HS_inject(HS_main);
  