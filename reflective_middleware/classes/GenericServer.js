/*
*	GenericServer Class
*/

function GenericServer(host,port) {
	this.http = require('http');
	this._host = host;
	this._port = port;
	this._server = null;
}

GenericServer.prototype.getHost = function() {
	return this._host;
}

GenericServer.prototype.getPort = function() {
	return this._port;
}


GenericServer.prototype.setPort = function(port) {
	this._port = port;
}

GenericServer.prototype.setHost = function(hostName) {
	this._host = hostName;
}

GenericServer.prototype.setHost = function(hostName) {
	this._host = hostName;
}

GenericServer.prototype.setHandleRequest = function(handleRequest) {
	this._handleRequest = handleRequest;
}

GenericServer.prototype.create = function() {
	var server = this.http.createServer(this._handleRequest);
	this._server = server;

}

GenericServer.prototype.listen = function() {
	this._server.listen(this._port,this._host, function() {
		console.log('(II) Server port %s', this.address().port);		
	});
}


module.exports = GenericServer;