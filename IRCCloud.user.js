// ==UserScript==
// @name    IRCCloud Utilities Script
// @version 2011-3-17_1
// @author  Daniel Jennings (sekkusu@gmail.com)
// @license MIT
//
// @require https://irccloud.com/static/js/dep/jquery-1.5.1.min.js
// @match   https://irccloud.com/*
// ==/UserScript==

(function () {

    function main () {
    
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
        $('body').css('font', 'normal 10pt "Consolas"');
        
        // Register for chat messages
        $('#buffer').bind('DOMNodeInserted', function (event) {
            var $target = $(event.target);
            if ($target.is('div.chat'))
                return onChatMessage($target);
        });
        
        // Register the context menu
        $('#buffer').delegate('div.type_buffer_msg span.author a.buffer', 'contextmenu', function (event) {
            console.log('right clicked');
            
            event.preventDefault();
        });
    }

    // http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
    // Modified to point to IRCCloud's jQuery (HTTPS, on-site)
    function addJQuery (callback) {
        var script = document.createElement("script");
        script.setAttribute("src", "static/js/dep/jquery-1.5.1.min.js");
        script.addEventListener('load', function() {
            var script = document.createElement("script");
            script.textContent = "(" + callback.toString() + ")();";
            document.body.appendChild(script);
        }, false);
        document.body.appendChild(script);
    }

    // Load jQuery and execute main
    addJQuery(main);
  
})();