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

function formatTimeForLogging(millisec){
  let hours = 0, mins = 0, secs = 0;
  if(millisec < 60000){ // if less than one min - print in seconds: 60000 milisec in one min
    secs = Math.floor(millisec / 1000);
  }else if(millisec < 3600000){ // if less than one hour - print in mins: 3600000 milisec in 1 hour
    mins = Math.floor(millisec / 60000);
    millisec %= 60000;
    secs = Math.floor(millisec / 1000);
  }else{ // otherwise print total hours, mins, and secs
    hours = Math.floor(millisec / 3600000);
    millisec %= 3600000;
    mins = Math.floor(millisec / 60000);
    millisec %= 60000;
    Math.floor(millisec / 1000);
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

async function searchStackoverflow() {
  let searchString = await vscode.window.showInputBox({ placeHolder: "Search StackOverflow..."});
  let idNumber;
  const URL = `https://api.stackexchange.com//2.2/search/excerpts?order=desc&sort=relevance&q=${searchString}&accepted=True&site=stackoverflow`;
  
  if (searchString === '' || searchString === undefined) return;
  superagent
    .get(URL)
    .then(response => {
      let data =JSON.parse(response.text);
      idNumber = data.items[0].question_id;})
    .catch(error => console.error(error));
  getQuestionLink(idNumber);
}

function getQuestionLink(questionId) {
  const URL = `https://api.stackexchange.com/2.2/questions/${questionId}?order=desc&sort=activity&site=stackoverflow`;
  superagent 
    .get(URL)
    .then(response => {
      let data =JSON.parse(response.text);
      console.log(data.items[0].link); })
    .catch(error => console.error(error));
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
    
  vscode.commands.registerCommand('extension.createGist', async function(){
    let accessToken = context.workspaceState.get('accessToken');
    console.log(`line 141: ${accessToken}`);
    if(!accessToken){
      accessToken = await askForToken();
      console.log(`line 144: ${accessToken}`);
      context.workspaceState.update('accessToken', accessToken);
      console.log('Successfully Added Access Token');
    }
    console.log(`line 148: ${accessToken}`);
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
  
  let disposable = vscode.commands.registerCommand('extension.knowyourcode', function () {
    vscode.window.showInformationMessage('Activating Know Your Code');
    myStatusBar.command = 'extension.statusBar';
    myStatusBar.text = '$(watch)';
    myStatusBar.show();
  });
  
  context.subscriptions.push(disposable);
  context.subscriptions.push(vscode.commands.registerCommand('extension.dadJoke', dadJokeRetriever));
  context.subscriptions.push(vscode.commands.registerCommand('extension.searchStackoverflow', searchStackoverflow));
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
