
var fs=require("fs");
var blockOrigins={};



function loadOrigins(){
	
	console.log("Reloading blocked origins");
	
	fs.readFile("./plugins/originBlock/blockedOrigins.txt","utf-8", function (err, data) {
		var originsBuffer={};
		if (err) throw err;
		
		data.split("\n").forEach(function(origin) {
			if (origin) {
				origin= origin.toLowerCase().trim();
				originsBuffer[origin] = true;
			}
		});
		
		blockOrigins=originsBuffer;
	});
}


exports.init=function(){
	loadOrigins();
	setInterval(loadOrigins,5*1000);
}


exports.rejectable = function(m) {
	var origin;
	
	if(!m.origin) return false;
	origin=m.origin;

	if (blockOrigins[origin]) {
		console.log("Blocked Origin:" + origin);
		return true;
	}
	
	return false;
};
