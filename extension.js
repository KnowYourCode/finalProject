// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const superagent = require('superagent');
const githubapi = require('@octokit/rest');
const editor = vscode.window.activeTextEditor;

// this method is called when the project has been created
function startTimer(){
  console.log('starting timer...');
  return new Date();
}

// this method is called when the project has been closed
// returns total time elapsed
function calculateTimeElapsed(start){
  let end = new Date();
  return end - start;
}

function formatTimeForLogging(milisec){
  if(milisec < 60000){ // if less than one min - print in seconds: 60000 milisec in one min
    return `Time spent: ${Math.floor(milisec / 1000)}secs`;
  }else if(milisec < 3600000){ // if less than one hour - print in mins: 3600000 milisec in 1 hour
    let mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    return `Time spent: ${mins}mins and ${Math.floor(milisec / 1000)}secs`;
  }else{ // otherwise print total hours, mins, and secs
    let hours = Math.floor(milisec / 3600000);
    milisec %= 3600000;
    let mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    return `Time spent: ${hours}hours, ${mins}mins, and ${Math.floor(milisec / 1000)}secs`;
  } 
}

// this method grabs a random joke from the icanhazdadjoke API
function dadJokeRetriever() {
  const URL = 'https://icanhazdadjoke.com/';
	superagent
	.get(URL)
	.set('Accept', 'application/json')
	.then(response => console.log(JSON.stringify(response.body.joke)))
	.catch(error => console.error(error));
}

// this method asks the user for a github access token
// if one didnt exsist. Then updates the workspace locally
// to store the token
async function askForToken(){
  let newToken = null;
  do{
    newToken = await vscode.window.showInputBox({ placeHolder: "Please Enter Your Github Personal Access Token"});
  }while(!newToken || newToken === '');
  return newToken;
}

// this method formats the highlighted/selected text into a gist
async function formatGist(){
  let text = editor.document.getText(editor.selection);
  let fileName = await vscode.window.showInputBox({ placeHolder: "Name Your Gist Here" });
  let description = await vscode.window.showInputBox({ placeHolder: "Describe Your Gist Here" });
  let gist = {
    "description": '',
    "public": true,
    "files": {}
  }
  gist.description = description;
  gist.files[fileName] = { "content" : text }
  return { gist, fileName };
}
// this method creates the POST requests for github
async function createGist(accessToken){
  let { gist, fileName } = await formatGist();
  let octokit = new githubapi({ auth: `token ${accessToken}` });
  let response = await octokit.gists.create(gist);
  if(response.status === 201){
    let body = response.data.files[fileName];
    let location = body.raw_url;
    console.log(`Gist successfully sent to: ${location}`);
  }else{
    console.log('Oops! Something went wrong. Please try again');
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  let isClicked = true;
  let myStatusBar = vscode.StatusBarItem;
  myStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
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
      let milisec = context.workspaceState.get('totalTime');
      let timeSpent = formatTimeForLogging(milisec);
      console.log(timeSpent);
    }
  });
	vscode.commands.registerCommand('extension.dadJoke', function() {
		dadJokeRetriever();
  });
  
  vscode.commands.registerCommand('extension.createGist', function(){
    let accessToken = context.workspaceState.get('accessToken');
    if(!accessToken){
      accessToken = askForToken();
      context.workspaceState.update('accessToken', accessToken);
      console.log('Successfully Added Access Token');
    }
    createGist(accessToken);
  });

  function statusBar(statusBar, start) {
    let totalElapsed = calculateTimeElapsed(start);
    statusBar.text = formatTimeForLogging(totalElapsed);
    
    statusBar.show();
  }

  vscode.window.onDidChangeTextEditorSelection(() => {
    if(!isClicked) {
      statusBar(myStatusBar,start);
    }
  });

  vscode.commands.registerCommand('extension.statusBar', function () {
    if(isClicked) {
      isClicked = false;
      statusBar(myStatusBar,start);
    }else {
      isClicked = true;
      myStatusBar.text = '$(watch)'; }
      isClicked = !isClicked;
  })

  let disposable = vscode.commands.registerCommand('extension.knowyourcode', function () {
    vscode.window.showInformationMessage('Activating Know Your Code');
    myStatusBar.command = 'extension.statusBar';
    myStatusBar.text = '$(watch)';
    myStatusBar.show();
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
