
// this method is called when the project has been created
function startTimer(){
  return new Date();
}

// this method is called when the project has been closed
// returns total time elapsed
function calculateTimeElapsed(start){
  let end = new Date();
  return end - start;
}

// this method converts millisecs to sec, mins, hours
// and returns a time object
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

exports.startTimer = startTimer;
exports.calculateTimeElapsed = calculateTimeElapsed;
exports.formatTimeForLogging = formatTimeForLogging;

module.exports = {
  startTimer,
  calculateTimeElapsed,
  formatTimeForLogging
}