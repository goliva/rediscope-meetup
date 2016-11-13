var timeOfChunkVideo = 10;
var interval = 5;
var lastThreeCalls = [];
var buffer = [];

function calculateAVGResponseTime(){
	var totalTime = 0;
	lastThreeCalls.forEach(function(time) {
	    totalTime += time;
	});
	return totalTime/3;
}

function itsNecessary(){
	var avgTime = calculateAVGResponseTime();
	if (avgTime < interval && interval < timeOfChunkVideo){
		if (buffer.length > 3){
			return false;
		} else {
			return true;
		}
	} else {
		return true;
	}
}