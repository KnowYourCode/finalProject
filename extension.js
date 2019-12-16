// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const dadJokeRetriever = require('./src/dad-joke.js');
const searchStackoverflow = require('./src/stack-overflow.js');
const { askForToken, createGist } = require('./src/github-gist.js');
const { startTimer, calculateTimeElapsed, formatTimeForLogging } = require('./src/timer.js');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  const start = startTimer();
  let isClicked = true;
  let myStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  console.log(`Started timer: ${start}`);

  function statusBar(start){
    let totalElapsed = calculateTimeElapsed(start);
    const { hours, mins, secs } = formatTimeForLogging(totalElapsed);
    myStatusBar.text = `${hours}:${mins}:${secs}`;
    myStatusBar.show();
  }
  
  function toggleStatusBar(){
    if(isClicked) { statusBar(start); }
    else { myStatusBar.text = '$(watch)'; }
    isClicked = !isClicked;
  }

  vscode.workspace.onDidCloseTextDocument(() => {
    let totalElapsed = calculateTimeElapsed(start);
    // If this is a new project, add current time
    if(!context.workspaceState.get('totalTime')){
      context.workspaceState.update('totalTime', totalElapsed);
    }else{ // otherwise get prev time & add in current time & update workspace
      let totalTime = context.workspaceState.get('totalTime');
      totalTime += totalElapsed;
      context.workspaceState.update('totalTime', totalTime);
      const { hours, mins, secs } = formatTimeForLogging(totalTime);
      console.log(`Time spent: ${hours}hrs, ${mins}mins, and ${secs}secs`);
    }
  });
    
  vscode.commands.registerCommand('extension.createGist', async function(){
    let accessToken = context.workspaceState.get('accessToken');
    if(!accessToken){
      accessToken = await askForToken();
      context.workspaceState.update('accessToken', accessToken);
      console.log('Successfully Added Access Token');
    }
    createGist(accessToken);
  });
  
  let disposable = vscode.commands.registerCommand('extension.knowyourcode', function () {
    vscode.window.showInformationMessage('Activating Know Your Code');
    myStatusBar.command = 'extension.statusBar';
    myStatusBar.text = '$(watch)';
    myStatusBar.show();
  });
  
  context.subscriptions.push(disposable);
  context.subscriptions.push(vscode.commands.registerCommand('extension.dadJoke', dadJokeRetriever));
  context.subscriptions.push(vscode.commands.registerCommand('extension.searchStackoverflow', searchStackoverflow));
  context.subscriptions.push(vscode.commands.registerCommand('extension.statusBar', toggleStatusBar));
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
  deactivate,
}
