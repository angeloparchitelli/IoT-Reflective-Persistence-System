/*
*	DataObserver
*/

function DataObserver (channel) {
	this.redis = require("redis");
	this.client = this.redis.createClient();
	this.channel = channel;
}

DataObserver.prototype.sendMessage = function(data) {
	this.client.publish(this.channel, JSON.stringify(data));
};

module.exports = DataObserver;
