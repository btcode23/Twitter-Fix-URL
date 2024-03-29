// ==UserScript==
// @name         Twitter Fix URL
// @namespace    https://github.com/btcode23
// @version      0.1.1
// @description  adds button to share vxtwitter URL instead of twitter URL
// @author       btcode23
// @match        https://twitter.com/*
// @icon         https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png
// @downloadURL https://update.greasyfork.org/scripts/491145/Twitter%20Fix%20URL.user.js
// @updateURL https://update.greasyfork.org/scripts/491145/Twitter%20Fix%20URL.meta.js

// ==/UserScript==

const baseUrl = 'https://vxtwitter.com';
const svg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M12 11V17M12 17L10 15M12 17L14 15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '</svg>';

function displayConfirmation(){
    const layers = document.getElementById('layers');
    var confirmation;
    if (!document.getElementById('confirmCopyAltLink')) {
        console.log('hi');
        confirmation = document.createElement('div');
        confirmation.id = 'confirmCopyAltLink';
        confirmation.style.cssText = 'position: fixed; bottom: 10px; left: 0; right: 0; margin-left: auto; margin-right: auto; width: 100px; height: 40px;' +
            'background-color: rgba(29, 161, 242, 0.9); border-radius: 5px;'
        confirmation.innerHTML = '<p style="line-height: 40px; margin: 0; padding: auto; vertical-align: middle; text-align: center; font-weight: bold;">Copied</p>';
        layers.append(confirmation);
    } else {
        confirmation = document.getElementById('confirmCopyAltLink');
    }

    // show confirmation and then fade out
    confirmation.style.opacity = '1';
    confirmation.style.visibility = 'visible';
    confirmation.style.transition = '';
    setTimeout(function() {
        confirmation.style.opacity = '0';
        confirmation.style.visibility = 'hidden';
        confirmation.style.transition = '1s';
    }, 1000);
}

function copyAlternativeTwitterUrl(tweet) {
    // the part of the tweet with time seems to give the path to the tweet
    const tweetPath = tweet.querySelector('a:has(time)').getAttribute('href');
    const newUrl = baseUrl + tweetPath; // new share URL

    console.log(newUrl);
    navigator.clipboard.writeText(newUrl);
    displayConfirmation();
}

function designButton(tweet) {
    const group = tweet.querySelector('div[role="group"]');
    const otherIcon = group.querySelector('div[aria-label="Share post"]');

    const newIconPadding = document.createElement('div');
    group.insertBefore(newIconPadding, otherIcon.sibling);
    newIconPadding.classList.add('custom-copy-icon');
    const computedStyle = getComputedStyle(otherIcon);
    const adjustedIconSize = Number(computedStyle.height.split('px')[0]); // square size based on share icon's height
    newIconPadding.style.height = adjustedIconSize + 'px';
    newIconPadding.style.width = adjustedIconSize + 'px';
    const adjustedPadding = adjustedIconSize / 4; // move new share icon over relative to size
    newIconPadding.style.paddingLeft = adjustedPadding + 'px';

    const newIcon = document.createElement('div'); // create element to fit highlighted circle
    newIconPadding.append(newIcon);
    const computedStyleCircle = getComputedStyle(otherIcon.firstChild.firstChild.firstChild);
    const adjustedIconCircleSize = Number(computedStyleCircle.height.split('px')[0]);
    newIcon.style.height = adjustedIconCircleSize + 'px';
    newIcon.style.width = adjustedIconCircleSize + 'px';
    newIcon.style.marginLeft = '50%'; // center element
    newIcon.style.marginTop = '50%';
    newIcon.style.transform = 'translate(-50%, -50%)';

    newIcon.innerHTML = svg; // add clipboard svg
    const icon = newIcon.querySelector('svg');
    const computedStyleIcon = getComputedStyle(otherIcon.querySelector('svg'));
    const adjustedIconeSize = Number(computedStyleIcon.height.split('px')[0]);
    icon.style.height = adjustedIconeSize + 'px';
    icon.style.width = adjustedIconeSize + 'px';
    const iconOriginalColor = computedStyleIcon.color;
    icon.querySelector('path').style.stroke = iconOriginalColor; // set color to same as other icon
    icon.style.padding = (adjustedIconCircleSize - adjustedIconeSize) / 2 + 'px';
    icon.style.borderRadius = '50%'; // make background border a circle

    // highlight icon when mouseover event using twitter blue color
    // should look the same as the other icons
    newIcon.addEventListener('mouseover', function() {
        icon.style.backgroundColor = 'rgba(29, 161, 242, 0.1)';
        icon.querySelector('path').style.stroke = 'rgba(29, 161, 242, 1)';
    });

    // return to original style when mouseleave event
    newIcon.addEventListener('mouseleave', function() {
        icon.style.backgroundColor = '';
        icon.querySelector('path').style.stroke = iconOriginalColor;
    });

    // copy link using alternative domain
    newIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        copyAlternativeTwitterUrl(tweet);
    });
}

function addNewShareButtons() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(tweet => {
        if (!tweet.querySelector('.custom-copy-icon')) {
            designButton(tweet);
        }
    });
}

(function() {
    'use strict';

    // add new share button to each loaded tweet
    const observer = new MutationObserver(addNewShareButtons);
    observer.observe(
        document.body, {
            childList: true,
            subtree: true
        });
})();
