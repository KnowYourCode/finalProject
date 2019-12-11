// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const superagent = require('superagent');
const vscode = require('vscode');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "knowyourcode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		timeTracker(context);
		// Display a message box to the user
		vscode.window.showInformationMessage('Know Your Code is active.');
	});

	let dadJoke = vscode.commands.registerCommand('extension.dadJoke', function() {
		dadJokeRetriever();
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function timeTracker(context) {
		const sessionStartTime = Date.now();
		console.log(Math.floor((sessionStartTime - sessionStartTime)/1000) + "seconds");
		context.globalState.update('start', sessionStartTime);
		console.log(context.globalState.get('start'));
}

function dadJokeRetriever() {
	superagent
	.get('https://icanhazdadjoke.com/')
	.set('Accept', 'application/json')
	.then(res => console.log(JSON.stringify(res.body.joke)))
	.catch(error => console.error(error));
}

module.exports = {
	activate,
	deactivate
}