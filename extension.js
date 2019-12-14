// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const superagent = require('superagent');
const githubapi = require('@octokit/rest');
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
  return end - start;
}

function formatTimeForLogging(milisec){
  let hours = 0, mins = 0, secs = 0;
  if(milisec < 60000){ // if less than one min - print in seconds: 60000 milisec in one min
    secs = Math.floor(milisec / 1000);
  }else if(milisec < 3600000){ // if less than one hour - print in mins: 3600000 milisec in 1 hour
    mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    secs = Math.floor(milisec / 1000);
  }else{ // otherwise print total hours, mins, and secs
    hours = Math.floor(milisec / 3600000);
    milisec %= 3600000;
    mins = Math.floor(milisec / 60000);
    milisec %= 60000;
    Math.floor(milisec / 1000);
  } 
  return { hours, mins, secs };
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

// this method sets WebView content
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

function searchStackoverflow() {
  const URL = 'https://api.stackexchange.com//2.2/search/excerpts?order=desc&sort=relevance&q=404 error&accepted=True&site=stackoverflow';
	superagent
	.get(URL)
  .then(response => {
    let data =JSON.parse(response.text);
    console.log(data.items[0].question_score);
  })
	.catch(error => console.error(error));
}

function getQuestionLink () {
  const URL = 'https://api.stackexchange.com/2.2/questions/18365315?order=desc&sort=activity&site=stackoverflow';
  superagent 
    .get(URL)
    .then(response => {
      let data =JSON.parse(response.text);
      console.log(data.items[0].owner.link);
    })
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
      const { hours, mins, secs } = formatTimeForLogging(milisec);
      console.log(`Time spent: ${hours}hrs, ${mins}mins, and ${secs}secs`);
    }
  });

	context.subscriptions.push(vscode.commands.registerCommand('extension.dadJoke', function() {
    //dadJokeRetriever();
    searchStackoverflow();
    //getQuestionLink();
  }));
    
  vscode.commands.registerCommand('extension.createGist', function(){
    let accessToken = context.workspaceState.get('accessToken');
    if(!accessToken){
      accessToken = askForToken();
      context.workspaceState.update('accessToken', accessToken);
      console.log('Successfully Added Access Token');
    }
    createGist(accessToken);
  });
  
  function statusBar(statusBar, start){
    let totalElapsed = calculateTimeElapsed(start);
    const { hours, mins, secs } = formatTimeForLogging(totalElapsed);
    statusBar.text = `${hours}:${mins}:${secs}`;
    statusBar.show();
  }

  vscode.window.onDidChangeTextEditorSelection(() => {
    if(!isClicked) {
      statusBar(myStatusBar,start);
    }
  });

  vscode.commands.registerCommand('extension.statusBar', function () {
    if(isClicked) {statusBar(myStatusBar,start);}
    else {myStatusBar.text = '$(watch)'; }
    isClicked = !isClicked;
  });

  // registers Cat Coding (Webview) command to start Webview
  context.subscriptions.push(vscode.commands.registerCommand('catCoding.start', () => {
    let panel = vscode.window.createWebviewPanel(
      'catCoding',
      'CatCoding',
      vscode.ViewColumn.One,
      {}
    );
    panel.webview.html = getWebviewContent();
  }));
  
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
