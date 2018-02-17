/*
 * Server class
 */

var GenericServer = require("./GenericServer");
var FileObserver = require("./FileObserver");
var DataObserver = require("./DataObserver");


function Server(host, port) {
	GenericServer.call(this, host, port);

	var parent = this;

	this.shortid = require('shortid');						
	this.fileObserver = new FileObserver('settings.json');	
	this.dataObserver = new DataObserver('iot-data');		

	this.setHandleRequest(function(gwReq, gwRes) {			
		/* gwReq: Req gateway
		 * gwBody: body
		 * dhReq: req to deviceHive
		 * dhRes: respone from deviceHive
		 * dhBody: body req
		 * gwRes: resp from gateway
		 */		
		gwBody = "";
		var dhOptions = parent.getDHHeaders(gwReq);

	    gwReq.on('data', function (chunk) {
	        gwBody += chunk;
	    }); 

	    gwReq.on('end', function () {
			console.log("(II) Request from " + gwReq.headers.host + " to " + dhOptions.host + dhOptions.path);
			console.log("(==) Method: " + dhOptions.method);
			console.log("(==) Body: " + gwBody);

			//Se il body della richiesta proveniente dal gateway non è vuota analizziamola
			if(gwBody != "") parent.analyzeData(gwBody);

			var dhReq = parent.http.request(dhOptions, function(dhRes) {
				dhBody = "";
				dhRes.setEncoding('utf8');

				dhRes.on('data', function (chunk) {
					dhBody += chunk;
				});

				dhRes.on('end', function() {
					gwRes.end(dhBody);
					console.log("(II) Request sent\n");
				});
			});

			dhReq.write(gwBody);
			dhReq.end();
		});
	});
}

Server.prototype = Object.create(GenericServer.prototype);
Server.prototype.constructor = Server;

Server.prototype.getDHHeaders = function(gwReq) {
	var options = {
		host: 'playground.devicehive.com',
		path: '/api/rest' + gwReq.url,
		method: gwReq.method,
		headers: {
			'Authorization': gwReq.headers['authorization'],
			'User-Agent': gwReq.headers['user-agent'],
			'Accept-Encoding': gwReq.headers['accept-encoding'],
			'Content-Type': 'application/json'
		}
	}

	if(gwReq.headers['auth-deviceid'] !== undefined) {
		options['headers']['Auth-DeviceId'] = gwReq.headers['auth-deviceid'];
	}

	if(gwReq.headers['auth-deviceid'] !== undefined) {
		options['headers']['Auth-DeviceKey'] = gwReq.headers['auth-devicekey'];
	}

	return options;
};

Server.prototype.analyzeData = function(data) {
	console.log("(II) Parsing data from Arduino");
	try {
		var jsonParsed = JSON.parse(data);

		//Se abbiamo ricevuto una notifica di DeviceHive
		if(jsonParsed["notification"] != undefined) {
			var params = jsonParsed["parameters"];
			var settings = this.fileObserver.getSettings();
			var device = null;

			//Controllo se esiste una regola relativa al device di cui si sta ricevendo la notifica
			console.log(settings);
			for(d in settings) {
				if(d == params["id"]){
					device = d;
					break;
				}
			}

			//Se una regola relativa a tale device esiste
			if(device != null) {
				console.log("(II) Notification received for device \"" + device + "\"");

				//Controllo se esiste una regola relativa ai sensori indicati nella notifica
				for(notifSensor in params["sensors_data"]) {
					for(sensor in settings[device]) {
						if(notifSensor == sensor) {
							//In caso positivo, la applico
							for(rule in settings[device][sensor]) {
								this.applyRule(device, sensor, params["sensors_data"][sensor], 
									settings[device][sensor][rule], params["timestamp"]);
							}
						}
					}
				}		
			} else {
				console.log("(WW) No rule defined for this device!");
			}
		}
	} catch(e) {
		console.log("(EE) JSON Parse Error: " + e);
	}
};

Server.prototype.getMatchingFlag = function(rule) {
	if(rule) {
		console.log("(==) Rule valid for this value");
		return true;
	} else {
		console.log("(==) Rule invalid for this value");
		return false;
	}
};

Server.prototype.applyRule = function(device, sensor, value, rule, timestamp) {
	console.log("(II) Applying rule \"" + rule["action"] + "(" + rule["argument"] + ", " + rule["variable_action"]["condition"] + ", " + rule["variable_action"]["value"] + ")\"");
	console.log("(==) Value for sensor \"" + sensor + "\": " + value);

	var svalue = value;
	var rvalue = parseInt(rule["variable_action"]["value"]);
	var matching_flag = false;
	switch(rule["variable_action"]["condition"]) {
		case "lessThan": {
			matching_flag = this.getMatchingFlag(svalue < rvalue);
			break;
		}
		case "moreThan": {
			matching_flag = this.getMatchingFlag(svalue > rvalue);
			break;
		}
		case "equals": {
			matching_flag = this.getMatchingFlag(svalue == rvalue);
			break;
		}
		default: {
			console.log("(EE) Invalid rule");
			break;
		}
	}
	if (matching_flag==true) {
		console.log("(II) Publishing to Redis");
		var message = { 'id':this.shortid.generate(), 'rule':rule["action"] ,'rule_where':rule["argument"],'data':{'device': device, 'value':value, 'sensor':sensor, 'timestamp':timestamp}};
		this.dataObserver.sendMessage(message);
	} else {
		console.log("(WW) Event not published");
	}
};

module.exports = Server;