# LeetCode Tools

A collection of Tampermonkey scripts to enhance your LeetCode experience with problem tracking, timing, and progress visualization.

## Features

### LeetCode Score
- Track your problem-solving progress with thumbs up/down indicators
- Measure your solving time with an integrated stopwatch
- Auto-starts timer when you begin typing
- Pauses timer when submitting solutions
- Tracks average solving time per problem
- Visual progress tracking on the problems page

### LeetCode Problem List Enhancer
- Enhanced problem list view with status indicators
- Visual feedback for solved, failed, and unattempted problems
- Quick status updates directly from the problem list

## Installation

Note: Right now the script is only fully functional on *Chrome*!

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. Install the scripts:
   - [LeetCode Score](https://github.com/alaskaalex/leetcode-score/raw/refs/heads/main/LeetCodeScore.user.js)
   - [LeetCode Problem List Enhancer](https://github.com/alaskaalex/leetcode-score/raw/refs/heads/main/LeetCodeProblemList.user.js)

   Click the links above and Tampermonkey will prompt you to install the scripts.

## Usage

### LeetCode Score
1. Navigate to any LeetCode problem
2. The stopwatch will automatically start when you begin typing
3. Use the thumbs up/down buttons to mark your solution status:
   - 👍 (Thumbs Up): Solution solved optimally within the time limit
   - 👎 (Thumbs Down): Solution not successfully solved within the time limit
4. Double-click the timer to reset it
5. View your progress and average solving time in the scorecard

### Problem List Enhancer
1. Visit the LeetCode problems page
2. Each problem will show its status:
   - 👍 (Green): Successfully solved
   - 👎 (Red): Last attempt failed
   - ➖ (Gray): Not attempted

## Features in Detail

### Stopwatch
- Auto-starts when you begin typing
- Pauses automatically when submitting
- Double-click to reset
- Shows elapsed time in MM:SS.ms format
- Color-coded states:
  - Green: Running
  - Yellow: Paused
  - Gray: Stopped

### Progress Tracking
- Tracks problem status across sessions
- Calculates average solving time
- Visual progress indicators
- Persistent storage using localStorage

## Contributing

Feel free to submit issues and enhancement requests!