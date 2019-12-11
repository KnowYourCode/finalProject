// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when the project has been created
function startTimer(){
  console.log('starting timer...');
  return new Date();
}

// this method is called when the project has been closed
// returns total time elapsed
function calculateTimeElapsed(start){
  let end = new Date();
  let elapsedTime = end - start;
  console.log(`elapsed time: ${elapsedTime}`);
  return elapsedTime;
}

function formatTimeForLogging(context){
  let milisec = context.workspaceState.get('totalTime');
  if(milisec < 60000){ // if less than one min - print in seconds: 60000 milisec in one min
    return `Time spent: ${milisec / 1000}secs`;
  }else if(milisec < 3600000){ // if less than one hour - print in mins: 3600000 milisec in 1 hour
    let mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    return `Time spent: ${mins}mins and ${milisec / 1000}secs`;
  }else{ // otherwise print total hours, mins, and secs
    let hours = Math.floor(milisec / 3600000);
    milisec %= 3600000;
    let mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    return `Time spent: ${hours}hours, ${mins}mins, and ${milisec / 1000}secs`;
  } 
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  const start = startTimer();
  console.log(`Started at: ${start}`);

  vscode.workspace.onDidCloseTextDocument(() => {
    let totalElapsed = calculateTimeElapsed(start);
    if(!context.workspaceState.get('totalTime')){
        console.log(`Nothing in workspace: ${context.workspaceState.get('totalTime')}`);
        context.workspaceState.update('totalTime', totalElapsed);
        console.log(`Added to workspace: ${context.workspaceState.get('totalTime')}`);
    }else{
      let totalTime = context.workspaceState.get('totalTime');
      totalTime += totalElapsed;
      context.workspaceState.update('totalTime', totalTime);
      let result = formatTimeForLogging(context);
      console.log(`Updated workspace: ${context.workspaceState.get('totalTime')}`);
      console.log(result);
    }
  });
	let disposable = vscode.commands.registerCommand('extension.knowyourcode', function () {
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
