// ==UserScript==
// @name         LeetCode Progress Tracker
// @namespace    https://github.com/alaskaalex/leetcode-score
// @version      1.0.0
// @description  Track your LeetCode progress with detailed statistics, solve times, and success rates
// @author       alaskaalex
// @match        https://leetcode.com/problems/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leetcode.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://cdn.jsdelivr.net/npm/ag-charts-community/dist/umd/ag-charts-community.js
// @grant window.onurlchange
// @run-at       document-idle
// ==/UserScript==

const css = `.scorecard {
     display: none;
     background-color: #292929;
     border: 1px solid #444;
     right: 0px;
     margin-top: 35px;
     padding: 20px;
     position: absolute;
     line-height: normal;
     text-align: right;
     border-radius: 8px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
     max-width: 800px;
     min-width: 600px;
     color: #f1f1f1;
}

.scorecard-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 20px;
     padding-bottom: 10px;
     border-bottom: 2px solid #333;
}

.scorecard-title {
     font-size: 1.2em;
     font-weight: bold;
     color: #fff;
}

.scorecard-stats {
     display: flex;
     gap: 20px;
}

.stat-box {
     background: #232323;
     padding: 10px 15px;
     border-radius: 6px;
     text-align: center;
     color: #f1f1f1;
}

.stat-value {
     font-size: 1.1em;
     font-weight: bold;
     color: #fff;
}

.stat-label {
     font-size: 0.9em;
     color: #bbb;
}

.scorecard table {
     margin-top: 20px;
     width: 100%;
     border-collapse: collapse;
     font-size: 0.9em;
     background: #232323;
     color: #f1f1f1;
}

.scorecard th {
     background: #232323;
     padding: 12px;
     text-align: left;
     font-weight: 600;
     color: #fff;
     border-bottom: 2px solid #444;
}

.scorecard td {
     padding: 12px;
     border-bottom: 1px solid #444;
     color: #f1f1f1;
}

.scorecard tr:hover {
     background-color: #333;
}

.difficulty-easy {
     color: #28d17c;
}

.difficulty-medium {
     color: #ffc107;
}

.difficulty-hard {
     color: #ff5c5c;
}

.ratio-high {
     color: #28d17c;
}

.ratio-medium {
     color: #ffc107;
}

.ratio-low {
     color: #ff5c5c;
}

#graph {
     margin-top: 10px;
     height: 250px;
     border-top: 2px solid #333;
     padding-top: 10px;
     background: #232323;
}

.last-solved-box {
     display: inline-flex;
     align-items: center;
     background: #232323;
     padding: 6px 12px;
     border-radius: 6px;
     margin-right: 10px;
     font-size: 0.9em;
     color: #f1f1f1;
     border: 1px solid #444;
}

.last-solved-label {
     margin-right: 8px;
     color: #bbb;
}

.last-solved-date {
     font-weight: 500;
     color: #fff;
}

.thumbs-up-particle {
     position: fixed;
     pointer-events: none;
     z-index: 9999;
     animation: explodeAndFall 3s cubic-bezier(0.1, 0.7, 1.0, 0.1) forwards;
     filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.5));
}

@keyframes explodeAndFall {
     0% {
         transform: translate(0, 0) rotate(0deg) scale(1);
         opacity: 1;
     }
     20% {
         transform: translate(var(--tx), var(--ty)) rotate(180deg) scale(1.2);
         opacity: 1;
     }
     40% {
         transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(1);
         opacity: 1;
     }
     100% {
         transform: translate(var(--tx), calc(100vh - 50px)) rotate(720deg) scale(0.5);
         opacity: 0;
     }
}

@keyframes pulse {
     0% { transform: scale(1); }
     50% { transform: scale(1.2); }
     100% { transform: scale(1); }
}

.thumbs-up-button-pulse {
     animation: pulse 0.3s ease-in-out;
}

#correct-overlay {
    animation: correctExplosion 0.5s cubic-bezier(.2,1.8,.4,1) forwards;
}
@keyframes correctExplosion {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    70% {
        opacity: 1;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.stopwatch-display {
    display: inline-block;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: #f1f1f1;
    background: #232323;
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 8px;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
}

.stopwatch-running {
    color: #28d17c;
    text-shadow: 0 0 8px rgba(40, 209, 124, 0.3);
}

.stopwatch-paused {
    color: #ffc107;
    text-shadow: 0 0 8px rgba(255, 193, 7, 0.3);
}

.stopwatch-stopped {
    color: #ff5c5c;
    text-shadow: 0 0 8px rgba(255, 92, 92, 0.3);
}
`;

const blob = JSON.parse(localStorage.getItem('scorecard:blob') || "{}");
let score;
let scorecard;
let slug = null;
let stopwatchInterval = null;
let stopwatchTime = 0;
let stopwatchState = 'stopped'; // 'stopped', 'running', 'paused'
let lastClickTime = 0;
let scorecardclicked = false;

function getQData() {
    const scriptNode = document.querySelector("#__NEXT_DATA__");
    const jsonData = JSON.parse(scriptNode.innerHTML);
    const page_props = jsonData.props.pageProps;
    const question = page_props.dehydratedState.queries[1].state.data.question;
    const qdata = {
        qid: question.questionFrontendId,
        title: question.title,
        slug: question.titleSlug,
        difficulty: question.difficulty,
        tags: question.topicTags
    };
    return qdata;
}

function gets(setting, default_value) {
    if (blob[setting] != null) {
        return blob[setting];
    } else {
        return default_value;
    }
}

function sets(key, value) {
    if (value != null) {
        blob[key] = value;
    } else {
        delete blob[key];
    }
    localStorage.setItem('scorecard:blob', JSON.stringify(blob));
}

(function() {
    'use strict';

    // Add Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const thumbs_down_icon = 'M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16H286.5c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8H384c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H32z';
    const thumbs_up_icon =   'M323.8 34.8c-38.2-10.9-78.1 11.2-89 49.4l-5.7 20c-3.7 13-10.4 25-19.5 35l-51.3 56.4c-8.9 9.8-8.2 25 1.6 33.9s25 8.2 33.9-1.6l51.3-56.4c14.1-15.5 24.4-34 30.1-54.1l5.7-20c3.6-12.7 16.9-20.1 29.7-16.5s20.1 16.9 16.5 29.7l-5.7 20c-5.7 19.9-14.7 38.7-26.6 55.5c-5.2 7.3-5.8 16.9-1.7 24.9s12.3 13 21.3 13L448 224c8.8 0 16 7.2 16 16c0 6.8-4.3 12.7-10.4 15c-7.4 2.8-13 9-14.9 16.7s.1 15.8 5.3 21.7c2.5 2.8 4 6.5 4 10.6c0 7.8-5.6 14.3-13 15.7c-8.2 1.6-15.1 7.3-18 15.1s-1.6 16.7 3.6 23.3c2.1 2.7 3.4 6.1 3.4 9.9c0 6.7-4.2 12.6-10.2 14.9c-11.5 4.5-17.7 16.9-14.4 28.8c.4 1.3 .6 2.8 .6 4.3c0 8.8-7.2 16-16 16H286.5c-12.6 0-25-3.7-35.5-10.7l-61.7-41.1c-11-7.4-25.9-4.4-33.3 6.7s-4.4 25.9 6.7 33.3l61.7 41.1c18.4 12.3 40 18.8 62.1 18.8H384c34.7 0 62.9-27.6 64-62c14.6-11.7 24-29.7 24-50c0-4.5-.5-8.8-1.3-13c15.4-11.7 25.3-30.2 25.3-51c0-6.5-1-12.8-2.8-18.7C504.8 273.7 512 257.7 512 240c0-35.3-28.6-64-64-64l-92.3 0c4.7-10.4 8.7-21.2 11.8-32.2l5.7-20c10.9-38.2-11.2-78.1-49.4-89zM32 192c-17.7 0-32 14.3-32 32V448c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32H32z';
    const reset_icon = 'M40 224c-13.3 0-24-10.7-24-24V56c0-13.3 10.7-24 24-24s24 10.7 24 24v80.1l20-23.5C125 63.4 186.9 32 256 32c123.7 0 224 100.3 224 224s-100.3 224-224 224c-50.4 0-97-16.7-134.4-44.8c-10.6-8-12.7-23-4.8-33.6s23-12.7 33.6-4.8C179.8 418.9 216.3 432 256 432c97.2 0 176-78.8 176-176s-78.8-176-176-176c-54.3 0-102.9 24.6-135.2 63.4l-.1 .2 0 0L93.1 176H184c13.3 0 24 10.7 24 24s-10.7 24-24 24H40z';

    waitForKeyElements("#ide-top-btns", function () {
        document.head.appendChild(document.createElement("style")).innerHTML=css;

        const topBtns = document.querySelector('#ide-top-btns');
        // Remove the last div
        topBtns.lastElementChild.remove();
        
        var reset_button = makeButton(reset_icon, 'reset');
        var up_button = makeButton(thumbs_up_icon, 'up'); 
        var down_button = makeButton(thumbs_down_icon, 'down');
        
        // Create stopwatch display
        var stopwatch_display = document.createElement('div');
        stopwatch_display.className = 'stopwatch-display stopwatch-stopped';
        stopwatch_display.textContent = '00:00.00';
        stopwatch_display.style.cursor = 'pointer';
        stopwatch_display.onclick = function(event) {
            toggleStopwatch();
        };
        
        score = document.createElement('div');
        score.className += 'relative flex overflow-hidden rounded bg-fill-tertiary dark:bg-fill-tertiary ml-[6px] p-1';
        score.innerHTML = 'hello world';
        scorecard = document.createElement('div')
        scorecard.className += 'scorecard';
        updateScore();
        
        topBtns.insertBefore(reset_button, null);
        topBtns.insertBefore(down_button, null);
        topBtns.insertBefore(up_button, null);
        topBtns.insertBefore(stopwatch_display, null);
        topBtns.insertBefore(score, null);
        topBtns.insertBefore(scorecard, null);
        
        const buttons = [reset_button, up_button, down_button, score];

        // Add event listener for typing in the code editor
        waitForKeyElements('.monaco-editor', function() {
            const editor = document.querySelector('.monaco-editor');
            if (editor) {
                // Listen for keydown on the document since Monaco editor might be in an iframe
                document.addEventListener('keydown', function(event) {
                    // Only start if timer is stopped and at 0
                    if (stopwatchState === 'stopped' && stopwatchTime === 0) {
                        toggleStopwatch();
                    }
                });
            }
        });

        up_button.onclick = function(event) {
            set(true);
            showOverlay('https://bearytalecabin.com/wp-content/uploads/2025/05/correct-1.png', 'correct-overlay');
            // Pause timer if it's running
            if (stopwatchState === 'running') {
                stopwatchState = 'paused';
                clearInterval(stopwatchInterval);
                updateStopwatchDisplay();
            }
        };
        down_button.onclick = function(event) {
            set(false);
            showOverlay('https://bearytalecabin.com/wp-content/uploads/2025/05/wrong_3.png', 'wrong-overlay');
            // Pause timer if it's running
            if (stopwatchState === 'running') {
                stopwatchState = 'paused';
                clearInterval(stopwatchInterval);
                updateStopwatchDisplay();
            }
        };
        reset_button.onclick = function() {
            set(null);
        };
        score.onmouseover = function() {
            scorecard.style.display = 'block';
        };
        score.onmouseout = function() {
            if (!scorecardclicked) {
                scorecard.style.display = 'none';
            }
        };
        score.onclick = function() {
            if (!scorecardclicked) {
                scorecardclicked = true;
                scorecard.style.display = 'block';
            } else {
                scorecardclicked = false;
                scorecard.style.display = 'none';
            }
        };

        var qid = getQData().qid;
        updateButtonState(gets('last', null)?.[qid]?.pass);

        window.navigation.addEventListener("navigate", (event) => {
            const newSlug = /https:\/\/leetcode\.com\/problems\/([a-zA-Z0-9\-]+)/.exec(window.location)[1];
            if (slug == null) {
                slug = newSlug;
            } else if (slug != newSlug) {
                window.location.reload();
            }
        });
    });
})();

function getScoreSince(label, startDate) {
    const dates = since(startDate);
    return getScoreForDates(label, dates);
}

function getAllRecords() {
    const all_dates = since(forever());
    const obj = {}
    for (const d of all_dates) {
        var dayScore = gets(d);
        obj[d] = dayScore;
    }
    obj["last"] = gets("last");
    return obj;
}

function getAllQuestions() {
    last = gets("last");
    new_last = {}
    for (key in Object.keys(last).length) {
        new_last[key] = {
            slug: last[key].slug,
            qid: last[key].qid,

        }
    }
}

function getScoreForDates(label, dates) {
    var wins = 0;
    var attempts = 0;
    var easyW = 0;
    var easyA = 0
    var medW = 0;
    var medA = 0;
    var hardW = 0;
    var hardA = 0;
    var tags = {};
    var totalTime = 0;
    var problemsWithTime = 0; // Track number of problems that have time recorded

    for (const d of dates) {
        var dayScore = gets(d);
        if (dayScore) {
            attempts += Object.keys(dayScore).length;
            for (var qid in dayScore) {
                const win = (dayScore[qid].pass == true);
                if (win) {
                    wins++;
                }
                if (dayScore[qid].time) {
                    totalTime += dayScore[qid].time;
                    problemsWithTime++;
                }
                if (dayScore[qid].difficulty == "Easy"){
                    if (win) {
                        easyW++;
                    }
                    easyA++;
                }
                if (dayScore[qid].difficulty == "Medium"){
                    if (win) {
                        medW++;
                    }
                    medA++;
                }
                if (dayScore[qid].difficulty == "Hard"){
                    if (win) {
                        hardW++;
                    }
                    hardA++;
                }

                if (dayScore[qid].tags != null) {
                    for (const tag of dayScore[qid].tags) {
                        const tagName = tag.name;

                        if (!tags[tagName]) {
                            tags[tagName] = { wins: 0, attempts: 0 };
                        }

                        if (win) {
                            tags[tagName].wins += 1;
                        }

                        tags[tagName].attempts += 1;
                        tags[tagName].ratio = ratio(tags[tagName].wins, tags[tagName].attempts)
                    }
                }
            }
        }
    }

    const avgTime = problemsWithTime > 0 ? totalTime / problemsWithTime : 0;

    return {
        label: label,
        wins: wins,
        attempts: attempts,
        ratio: ratio(wins, attempts),
        ratioF: wins/attempts,
        avgTime: avgTime,
        easy: {
            wins: easyW,
            attempts: easyA,
            ratio: ratio(easyW, easyA),
            ratioF: easyW/easyA,
        },
        medium: {
            wins: medW,
            attempts: medA,
            ratio: ratio(medW, medA),
            ratioF: medW/medA,
        },
        hard: {
            wins: hardW,
            attempts: hardA,
            ratio: ratio(hardW, hardA),
            ratioF: hardW/hardA,
        },
        tags: tags
    };
}

function ratio(wins, attempts) {
    return ((attempts == 0) ? 0 : (wins * 1.0)/attempts).toFixed(2);
}

function updateScore() {
    console.log('updating score!');
    var timeranges = [
        getScoreSince('Daily', todaysDate())
    ];

    var weekCount = weeksSince(forever());
    var weekly = getScoreForDates("Weekly", week(weekCount));
    score.innerHTML = weekly.wins + '/' + weekly.attempts;

    // Get all weeks for the graph
    var allWeeks = [];
    for (var i = weekCount; i > 0; i--) {
        allWeeks.push(getScoreForDates(`Wk ${i}`, week(i)));
    }

    // Get only last 8 weeks for the table
    var tableWeeks = allWeeks.slice(0, 8);
    timeranges.push(...tableWeeks);

    var allTimeScore = getScoreSince('Alltime', forever());
    timeranges.push(allTimeScore);

    scorecard.innerHTML = '';
    
    // Add header with key stats
    var header = document.createElement('div');
    header.className = 'scorecard-header';
    header.innerHTML = `
        <div class="scorecard-title">LeetCode Progress</div>
        <div class="scorecard-stats">
            <div class="stat-box">
                <div class="stat-value">${allTimeScore.wins}/${allTimeScore.attempts}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${(allTimeScore.ratio * 100).toFixed(1)}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${allTimeScore.hard.wins}</div>
                <div class="stat-label">Hard Solved</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${formatTime(allTimeScore.avgTime)}</div>
                <div class="stat-label">Avg Time</div>
            </div>
        </div>
    `;
    scorecard.appendChild(header);

    // Create table with improved styling
    var table = '<table>' +
        '<tr>' +
            '<th>Time</th>' +
            '<th>Easy</th>' +
            '<th>Easy %</th>' +
            '<th>Medium</th>' +
            '<th>Medium %</th>' +
            '<th>Hard</th>' +
            '<th>Hard %</th>' +
            '<th>Total</th>' +
            '<th>Total %</th>' +
            '<th>Avg Time</th>' +
        '</tr>';
    
    for (let score of timeranges) {
        const getRatioClass = (ratio) => {
            const num = parseFloat(ratio);
            if (num >= 0.7) return 'ratio-high';
            if (num >= 0.5) return 'ratio-medium';
            return 'ratio-low';
        };

        table += '<tr>' +
            '<td>' + score.label + '</td>' +
            '<td class="difficulty-easy">' + score.easy.wins + '/' + score.easy.attempts + '</td>' +
            '<td class="' + getRatioClass(score.easy.ratio) + '">' + (score.easy.ratio * 100).toFixed(1) + '%</td>' +
            '<td class="difficulty-medium">' + score.medium.wins + '/' + score.medium.attempts + '</td>' +
            '<td class="' + getRatioClass(score.medium.ratio) + '">' + (score.medium.ratio * 100).toFixed(1) + '%</td>' +
            '<td class="difficulty-hard">' + score.hard.wins + '/' + score.hard.attempts + '</td>' +
            '<td class="' + getRatioClass(score.hard.ratio) + '">' + (score.hard.ratio * 100).toFixed(1) + '%</td>' +
            '<td>' + score.wins + '/' + score.attempts + '</td>' +
            '<td class="' + getRatioClass(score.ratio) + '">' + (score.ratio * 100).toFixed(1) + '%</td>' +
            '<td>' + formatTime(score.avgTime) + '</td>' +
            '</tr>';
    }
    table += '</table>';

    var scoretable = document.createElement('div');
    scoretable.innerHTML = table;
    scorecard.appendChild(scoretable);

    var graph = document.createElement('div');
    graph.id = 'graph';
    scorecard.appendChild(graph);

    // Chart Options - use all weeks for the graph
    const options = {
        container: graph,
        data: [allTimeScore, ...allWeeks.reverse()],
        series: [
            { type: 'line', marker: { fill: 'MediumSeaGreen' }, stroke: 'MediumSeaGreen', xKey: 'label', yKey: 'easy.ratioF', yName: 'Easy'},
            { type: 'line', marker: { fill: 'orange' }, stroke: 'orange', xKey: 'label', yKey: 'medium.ratioF', yName: 'Medium' },
            { type: 'line', marker: { fill: 'IndianRed' }, stroke: 'IndianRed', xKey: 'label', yKey: 'hard.ratioF', yName: 'Hard' },
            { type: 'line', marker: { fill: 'DeepSkyBlue' }, stroke: 'DeepSkyBlue', xKey: 'label', yKey: 'ratioF', yName: 'Any' },
        ],
        background: { fill: '#232323' },
        theme: {
            palette: {
                fills: ['#28a745', '#ffc107', '#dc3545', '#17a2b8'],
                strokes: ['#28a745', '#ffc107', '#dc3545', '#17a2b8'],
            },
            overrides: {
                common: {
                    title: { color: '#fff' },
                    legend: { item: { label: { color: '#f1f1f1' } } }
                },
                cartesian: {
                    axes: {
                        category: {
                            line: { color: '#888' },
                            tick: { color: '#888' },
                            label: { color: '#f1f1f1' },
                            gridLine: { color: '#333' }
                        },
                        number: {
                            line: { color: '#888' },
                            tick: { color: '#888' },
                            label: { color: '#f1f1f1' },
                            gridLine: { color: '#333' }
                        }
                    }
                }
            }
        },
        padding: {
            top: 10,
            right: 20,
            bottom: 20,
            left: 20,
        },
        legend: {
            position: 'bottom',
            spacing: 5,
        },
        axes: [
            {
                type: 'category',
                position: 'bottom',
                title: {
                    text: 'Time Period',
                    enabled: true,
                },
            },
            {
                type: 'number',
                position: 'left',
                title: {
                    text: 'Success Rate',
                    enabled: true,
                },
                min: 0,
                max: 1,
            },
        ],
    };

    // Create Chart
    agCharts.AgCharts.create(options);
}

function updateButtonState(pass) {
    if (pass == null) {
        document.querySelector('#up path').style.fill = 'currentColor';
        document.querySelector('#down path').style.fill = 'currentColor';
    } else if (pass == true) {
        document.querySelector('#up path').style.fill = 'green';
        document.querySelector('#down path').style.fill = 'currentColor';
    } else if (pass == false) {
        document.querySelector('#up path').style.fill = 'currentColor';
        document.querySelector('#down path').style.fill = 'red';
    }
}

function set(pass) {
    var qdata = getQData();
    var qid = qdata.qid;
    qdata.pass = pass;
    qdata.time = stopwatchTime;

    var last = gets('last', {});
    if (pass == null) {
        last[qid].pass = null;
    } else {
        last[qid] = qdata;
    }
    sets('last', last);

    var today = gets(todaysDate(), {});
    if (pass == null) {
        delete today[qid];
    } else {
        today[qid] = qdata;
    }
    sets(todaysDate(), today);
    updateScore();
    updateButtonState(pass);
}

function todaysDate() {
    const date = new Date();
    return dmy(date);
}

function since(startDate) {
    return between(startDate, new Date());
}

function between(startDate, endDate) {
    var result = [];

    var date = new Date(endDate);

    while (startDate < date) {
        result.push(dmy(date));
        date.setDate(date.getDate() - 1);
    }
    result.push(dmy(date));

    return result;
}

function dmy(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    return `${day}-${month}-${year}`;
}

function sunday(){
    var date = new Date();
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0,0,0,0);
    return date;
}

function weekBefore(date) {
    var result = new Date(date);
    result.setDate(result.getDate() - 7);
    result.setHours(0,0,0,0);
    return result;
}

function weeksSince(startDate) {
  // Calculate the difference in milliseconds
  const diffInMs = new Date() - startDate.getTime();

  // Convert milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Divide by 7 to get the number of weeks
  const weeksElapsed = Math.ceil(diffInDays / 7);

  return weeksElapsed;
}

function week(n) {
    var endDate = forever();
    endDate.setDate(endDate.getDate() + (7 * n));
    return weekEnding(endDate);
}

function weekEnding(endDate) {
    var startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);
    return between(startDate, endDate);
}

function forever(){
    let startDate = gets("start_date");
    if (!startDate) {
        // If no start date is set, use the Sunday before today
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        startDate = new Date(today.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        sets("start_date", startDate.toISOString());
    }
    return new Date(startDate);
}

function makeButton(icon, id) {
    var div = document.createElement('div');
    div.innerHTML = `<div id='${id}' class='relative flex overflow-hidden rounded bg-fill-tertiary dark:bg-fill-tertiary ml-[6px]'><div class='group flex flex-none items-center justify-center hover:bg-fill-quaternary dark:hover:bg-fill-quaternary'><div class='flex cursor-pointer p-2 text-gray-60 dark:text-gray-60' data-state='closed'><div class='relative text-[16px] leading-[normal] before:block before:h-4 before:w-4'><svg aria-hidden='true' focusable='false' data-prefix='far' data-icon='note-sticky' class='svg-inline--fa fa-note-sticky absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='${icon}'></path></svg></div></div></div></div>`;
    return div;
}

function showOverlay(imageUrl, overlayId) {
    // Remove any existing overlay with this id
    const existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = `#001225 url('${imageUrl}') center center / contain no-repeat`;
    overlay.style.zIndex = 99999;
    overlay.style.opacity = 1;
    overlay.style.transition = 'opacity 0.8s';

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.remove(), 800);
    }, 1500);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

function updateStopwatchDisplay() {
    const display = document.querySelector('.stopwatch-display');
    if (display) {
        display.textContent = formatTime(stopwatchTime);
        display.className = `stopwatch-display stopwatch-${stopwatchState}`;
    }
}

function toggleStopwatch() {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    lastClickTime = now;

    // If it's a double click (less than 300ms between clicks)
    if (timeSinceLastClick < 300) {
        resetStopwatch();
        return;
    }

    if (stopwatchState === 'stopped') {
        // Start
        stopwatchTime = 0;
        stopwatchState = 'running';
        stopwatchInterval = setInterval(() => {
            stopwatchTime += 10;
            updateStopwatchDisplay();
        }, 10);
    } else if (stopwatchState === 'running') {
        // Pause
        stopwatchState = 'paused';
        clearInterval(stopwatchInterval);
    } else if (stopwatchState === 'paused') {
        // Resume
        stopwatchState = 'running';
        stopwatchInterval = setInterval(() => {
            stopwatchTime += 10;
            updateStopwatchDisplay();
        }, 10);
    }
    updateStopwatchDisplay();
}

function resetStopwatch() {
    stopwatchTime = 0;
    stopwatchState = 'stopped';
    clearInterval(stopwatchInterval);
    updateStopwatchDisplay();
}