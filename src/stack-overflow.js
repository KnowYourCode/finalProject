const vscode = require('vscode');
const superagent = require('superagent');
const output = require('./output.js');

module.exports = async function searchStackoverflow() {
  let searchString = await vscode.window.showInputBox({ placeHolder: "Search StackOverflow..."});
  let idNumber;
  const URL = `https://api.stackexchange.com//2.2/search/excerpts?order=desc&sort=relevance&q=${searchString}&accepted=True&site=stackoverflow`;
  
  if (searchString === '' || searchString === undefined) return;
  superagent
    .get(URL)
    .then(response => {
      let data =JSON.parse(response.text);
      idNumber = data.items[0].question_id;
      getQuestionLink(idNumber); })
    .catch(error => console.error(error));
}

function getQuestionLink(questionId) {
  const URL = `https://api.stackexchange.com/2.2/questions/${questionId}?order=desc&sort=activity&site=stackoverflow`;
  superagent 
    .get(URL)
    .then(response => {
      let data =JSON.parse(response.text);
      output.appendLine(data.items[0].link); 
    })
    .catch(error => console.error(error));
}