const vscode = require('vscode');
const githubapi = require('@octokit/rest');
const editor = vscode.window.activeTextEditor;


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

exports.askForToken = askForToken;
exports.createGist = createGist;

module.exports = {
  askForToken,
  createGist
}