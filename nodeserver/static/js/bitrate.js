var timeOfChunkVideo = 10000; // because I know the chunks are from 10 seconds video
var lastThreeCalls = [];

function calculateAVGResponseTime(){
	var totalTime = 0;
	lastThreeCalls.forEach(function(time) {
	    totalTime += time;
	});
	return totalTime/lastThreeCalls.length;
}

function itsNecessary(){
	var avgTime = calculateAVGResponseTime();
	if (avgTime < delay && delay < timeOfChunkVideo){
		if (parent.buffer.length > 3){
			return false;
		} else {
			return true;
		}
	} else {
		return true;
	}
}

function addCallResponseTime(newTime){
	if (lastThreeCalls.length > 2){
		lastThreeCalls.shift();	
	}
	lastThreeCalls.push(newTime);
}