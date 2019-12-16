const superagent = require('superagent');

// this method grabs a random joke from the icanhazdadjoke API
module.exports = function dadJokeRetriever() {
  const URL = 'https://icanhazdadjoke.com/';
	superagent
	.get(URL)
	.set('Accept', 'application/json')
	.then(response => console.log(JSON.stringify(response.body.joke)))
	.catch(error => console.error(error));
}
