var log = require("../lib/logger.js");
var config = require('../config.js');
var nodemailer = require('nodemailer');
var redisProxy = require('../lib/redisProxy.js');
var origins = {};
var url = require("url");

var emailConfig = config.email, digestJade;
var core;
var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig.auth
});


function send(from,to,subject,html) {
    var email = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    transport.sendMail(email, function(error) {
        if(!error){
            log('Test message sent successfully!');
        }
        else{
            log("error in sending email: ",error);
            log("retrying......");
            setTimeout(function(){
                send(email.from, email.to, email.subject, email.html);
            },1000);
        }
    });
}

module.exports = function(core) {
	core.on("message", function(message, callback) {
		var originURL;
		callback();
		if(message && message.origin && message.origin.location) {
			originURL = url.parse(message.origin.location);
			redisProxy.get("DEPLOYMENT:"+message.to+":"+originURL.host, function(err, data) {
				if(data == null || typeof data.length=="undefined") {
					console.log("sending email notify");
					send(config.originnotify.from, config.originnotify.to, "New Deployment:"+originURL.host, "room:"+message.to+" deployed at "+message.origin.location);
				}
				redisProxy.set("DEPLOYMENT:"+message.to+":"+originURL.host, message.origin.location);
			});			
		}
	}, "watcher");
};