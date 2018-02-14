//Resize document body to make room for iframe
const HEIGHT = 80;
const viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const resized_height = viewport_height - HEIGHT;
const frameURL = 'https://flfk.github.io';

// Initialize iframe
var iframe_parent, iframe, kill;
populateElements();

// Send message to background.js on new page load
chrome.runtime.sendMessage({message: "new page"}, function(response) {});

// Listen for the response from background.js even if this isn't the active tab
// Note: IF THERE ARE X TABS OPEN IT WILL RUN X TIMES ON EACH TAB
chrome.runtime.onMessage.addListener(function(message_received, sender, sendResponse){
    if (message_received.currently_snoozed) {
        snoozeLogic();
    } else {
        wakeLogic();
    }
    // TODO: refactor background.js to inform Firebase of snoozes
});

// Snooze button handler
kill.addEventListener('click', () => {
    snoozeLogic();
    //Send message to background.js for snooze start
    chrome.runtime.sendMessage({message: "snooze"}, function(response) {});
});

//================ FUNCTIONS ================//

/**
 * Creates the DOM elements for the iframe, inserts classes and attributes,
 * then appends / inserts into the DOM
 */
function populateElements() {
    iframe_parent = document.createElement('div');
    $(iframe_parent)
      .addClass('iframe_parent')
      .appendTo('html');

    iframe = document.createElement('iframe');
    $(iframe)
      .attr('src', frameURL)
      .addClass('iframe')
      .css('height', HEIGHT+'px')
      .appendTo(iframe_parent);

    kill = document.createElement('img');
    $(kill)
      .attr('src', chrome.extension.getURL('images/cross.png'))
      .addClass('kill')
      .appendTo(iframe_parent);
}


/**
 * Resizes all elements in the DOM with a specific height to another specific
 * height. Note this is a slow running function as every element in the DOM
 * is queried and made into a jQuery object
 * @param  {Number} input_height  Select elements with this height value
 * @param  {Number} output_height Set their height to this value
 */
function resizeHeight(input_height, output_height) {
  $('*').filter(function() {
    return $(this).height() == input_height;
  }).css({
    'min-height': 0,
    'height': output_height+'px'
  });
}


/**
 * Handles the logic when user wants to snooze
 */
function snoozeLogic() {
  $(iframe_parent).hide();
  $('body').css('padding', '0');

  // Resize any downsized elements to full viewport
  resizeHeight(resized_height, viewport_height);
}


/**
 * Handles the logic when snooze is finished
 */
function wakeLogic() {
  $(iframe_parent).show();
  $('body').css('padding', '0px 0px '+HEIGHT+'px');

  // Downsize full height elements to allow room for the iframe
  // Wait for window load so that resizing won't be overridden by other scripts
  if (document.readyState  == 'complete') {
    resizeHeight(viewport_height, resized_height);
  } else {
    // Note: DOMContentLoaded event fires before scripts, so too early for
    // some single page applications like Facebook messenger
    window.addEventListener('load', function() {
      resizeHeight(viewport_height, resized_height);
    });
  }
}
