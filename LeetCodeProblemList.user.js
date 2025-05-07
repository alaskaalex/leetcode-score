// ==UserScript==
// @name         LeetCode Problem List Enhancer
// @namespace    https://github.com/alaska.alex/leetcode-score
// @version      1.0.0
// @description  Enhances LeetCode's problem list with additional features like filtering, sorting, and progress tracking. Companion to LeetCodeScore.js
// @author       Alexander Stek
// @match        https://leetcode.com/problemset/*
// @match        https://leetcode.com/studyplan/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leetcode.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant window.onurlchange
// @run-at       document-idle
// ==/UserScript==

const thumbs_down_icon = 'M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16H286.5c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8H384c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H32z';
const thumbs_up_icon =   'M323.8 34.8c-38.2-10.9-78.1 11.2-89 49.4l-5.7 20c-3.7 13-10.4 25-19.5 35l-51.3 56.4c-8.9 9.8-8.2 25 1.6 33.9s25 8.2 33.9-1.6l51.3-56.4c14.1-15.5 24.4-34 30.1-54.1l5.7-20c3.6-12.7 16.9-20.1 29.7-16.5s20.1 16.9 16.5 29.7l-5.7 20c-5.7 19.9-14.7 38.7-26.6 55.5c-5.2 7.3-5.8 16.9-1.7 24.9s12.3 13 21.3 13L448 224c8.8 0 16 7.2 16 16c0 6.8-4.3 12.7-10.4 15c-7.4 2.8-13 9-14.9 16.7s.1 15.8 5.3 21.7c2.5 2.8 4 6.5 4 10.6c0 7.8-5.6 14.3-13 15.7c-8.2 1.6-15.1 7.3-18 15.1s-1.6 16.7 3.6 23.3c2.1 2.7 3.4 6.1 3.4 9.9c0 6.7-4.2 12.6-10.2 14.9c-11.5 4.5-17.7 16.9-14.4 28.8c.4 1.3 .6 2.8 .6 4.3c0 8.8-7.2 16-16 16H286.5c-12.6 0-25-3.7-35.5-10.7l-61.7-41.1c-11-7.4-25.9-4.4-33.3 6.7s-4.4 25.9 6.7 33.3l61.7 41.1c18.4 12.3 40 18.8 62.1 18.8H384c34.7 0 62.9-27.6 64-62c14.6-11.7 24-29.7 24-50c0-4.5-.5-8.8-1.3-13c15.4-11.7 25.3-30.2 25.3-51c0-6.5-1-12.8-2.8-18.7C504.8 273.7 512 257.7 512 240c0-35.3-28.6-64-64-64l-92.3 0c4.7-10.4 8.7-21.2 11.8-32.2l5.7-20c10.9-38.2-11.2-78.1-49.4-89zM32 192c-17.7 0-32 14.3-32 32V448c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32H32z';
const minus_icon = 'M384 80c8.8 0 16 7.2 16 16V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16H384zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z';

const css = `#solved svg path {
    fill: green;
}
.inlineblock {
    display: inline-flex;
}
.ml5px {
    margin-left: 5px;
}
#failed svg path {
    fill: red;
}`;


const blob = JSON.parse(localStorage.getItem('scorecard:blob') || "{}");

function gets(setting, default_value) {
    if (blob[setting] != null) {
        return blob[setting];
    } else {
        return default_value;
    }
}


(function() {
    'use strict';

    var lastScore = gets('last', null);

    document.head.appendChild(document.createElement("style")).innerHTML=css;

    waitForKeyElements('a[href*="problems/"]', function (e) {
        e = e[0];
        if (lastScore){
            const slug = hrefToSlug(e.href);
            if (!slug) return;
            const lastResult = findResult(lastScore, slug);
            console.log(e);
            if (isSVGNode(e.firstChild)) {
                if (window.location.href.match(/studyplan/)){
                    e.firstChild.remove();
                } else {
                    return;
                }
            }
            if (e.firstChild == null || e.firstChild.nodeType == Node.TEXT_NODE){
                let tc = e.textContent;
                e.textContent = '';
                e.innerHTML = `<div><div class='inlineblock ml5px'>${tc}</div></div>`;
            }

            const child = e.firstChild;
            if (!child) return;
            if (lastResult && lastResult.pass) {
                const div = makeButton(thumbs_up_icon, 'solved');
                child.insertBefore(div, child.firstChild);
            } else if (lastResult){
                const div = makeButton(thumbs_down_icon, 'failed');
                child.insertBefore(div, child.firstChild);
            } else {
                const div = makeButton(minus_icon, 'notAttempted');
                child.insertBefore(div, child.firstChild);
            }
        }
    });
})();

function hrefToSlug(href) {
    const match = href.match(/problems\/([a-z0-9\-]+)(\/|\?)?/);
    if (match && match.length > 1) {
        return match[1];
    } else {
        return null;
    }
}

function findResult(lastScore, slug) {
    for (const [key, value] of Object.entries(lastScore)) {
        if (value.slug == slug) {
            return value;
        }
    }
    return null;
}

function makeButton(icon, id) {
    var div = document.createElement('div');
    div.className += 'inlineblock';
    div.innerHTML = `<div id='${id}' class='relative flex overflow-hidden rounded bg-fill-tertiary dark:bg-fill-tertiary ml-[6px]'><div class='group flex flex-none items-center justify-center hover:bg-fill-quaternary dark:hover:bg-fill-quaternary'><div class='flex cursor-pointer p-1 text-gray-60 dark:text-gray-60' data-state='closed'><div class='relative text-[16px] leading-[normal] before:block before:h-4 before:w-4'><svg aria-hidden='true' focusable='false' data-prefix='far' data-icon='note-sticky' class='svg-inline--fa fa-note-sticky absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='${icon}'></path></svg></div></div></div></div>`;
    return div;
}

function isSVGNode(node) {
    return node != null && node instanceof Element && node.namespaceURI === "http://www.w3.org/2000/svg";
}