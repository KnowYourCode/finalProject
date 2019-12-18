const superagent = require('superagent');
const output = require('./output.js');

// this method grabs a random joke from the icanhazdadjoke API
module.exports = function dadJokeRetriever() {
  const URL = 'https://icanhazdadjoke.com/';
	superagent
	.get(URL)
	.set('Accept', 'application/json')
	.then(response => output.appendLine(JSON.stringify(response.body.joke)))
	.catch(error => console.error(error));
}
