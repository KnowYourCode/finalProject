// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const superagent = require('superagent');
const editor = vscode.window.activeTextEditor;

const cats = {
  'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
};

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

async function createGist(){
  let text = editor.document.getText(editor.selection);
  let fileName = await vscode.window.showInputBox({ placeHolder: "Name Your Gist Here" });
  let description = await vscode.window.showInputBox({ placeHolder: "Describe Your Gist Here" });
  let gist = {
    "description": '',
    "public": true,
    "files": {}
  }
  gist.description = description;
  gist.files[fileName] = {"content" : text}
  console.log(gist);
  const URL = 'https://api.github.com/gist';
  superagent
    .post(URL)
    .send(gist)
    .set('Accept', 'application/vnd.github.v3+json')
    .then(response => {return response})
    .catch(error => console.error(error));
}

function dadJokeRetriever() {
	superagent
	.get('https://icanhazdadjoke.com/')
	.set('Accept', 'application/json')
  .then(res => console.log(JSON.stringify(res.body.joke)))
  .catch(error => console.error(error));
}

//WebView
function getWebviewContent() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
  </head>
  <body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
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

	context.subscriptions.push(vscode.commands.registerCommand('extension.dadJoke', function() {
    dadJokeRetriever();
  }));
    
	let disposable = vscode.commands.registerCommand('extension.knowyourcode', function () {
		vscode.window.showInformationMessage('Activating Know Your Code');
    	let myStatusBarItem = vscode.StatusBarItem;
			const greeting = 'Hello';
			myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
			myStatusBarItem.text = greeting;
		
			myStatusBarItem.show();
  });

  vscode.commands.registerCommand('extension.createGist', function(){
    let response = createGist();
    if(response.Status === '201 Created'){
      let location = response.Location;
      console.log(`Gist successfully sent to: ${location}`);
    }else{
      console.log(response.Status);
      console.log('Oops! Something went wrong. Please try again');
    }
  });

  //Web View Start
  context.subscriptions.push(vscode.commands.registerCommand('catCoding.start', () => {
    let panel = vscode.window.createWebviewPanel(
      'catCoding',
      'CatCoding',
      vscode.ViewColumn.One,
      {}
    );
    panel.webview.html = getWebviewContent();
  }));

	context.subscriptions.push(disposable);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

	module.exports = {
		activate,
		deactivate
	}
