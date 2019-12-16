// const vscode = require('vscode');


// const { calculateTimeElapsed, formatTimeForLogging } = require('./src/timer.js');

// function initializeStatusBar(){
//   myStatusBar.command = 'extension.statusBar';
//   myStatusBar.text = '$(watch)';
//   myStatusBar.show();
// }

// function statusBar(start){
//   let totalElapsed = calculateTimeElapsed(start);
//   const { hours, mins, secs } = formatTimeForLogging(totalElapsed);
//   myStatusBar.text = `${hours}:${mins}:${secs}`;
//   myStatusBar.show();
// }

// function toggleStatusBar(start){
//   if(isClicked) {statusBar(start);}
//   else {myStatusBar.text = '$(watch)'; }
//   isClicked = !isClicked;
// }

// exports.myStatusBar = myStatusBar;
// exports.toggleStatusBar = toggleStatusBar;

// module.exports = {
//   myStatusBar,
//   toggleStatusBar
// }