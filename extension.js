// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

	let myStatusBarItem = vscode.StatusBarItem;
	function activate(context) {
		
	
		let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
			const greeting = 'Hello';
			myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
			myStatusBarItem.text = greeting;
		
			myStatusBarItem.show();

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
