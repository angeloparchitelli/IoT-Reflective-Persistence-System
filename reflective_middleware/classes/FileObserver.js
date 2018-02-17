function FileObserver(fn) {
	this.fs = require('fs');
	this.setFileName(fn);
	this.settings = null;
};

FileObserver.prototype.observe = function() {
	console.log("(II) Observing file " + this.fileName);
	var p = this;
	p.fs.readFile(p.fileName, 'utf8', function(err, data) {
		if(err) {
			console.log("(EE) " + err);
		} else {
			console.log("(II) File read successfully");
			p.parseFile(data);
		}
	});

	this.fs.watchFile(p.fileName, function (curr, prev) {
		console.log("(II) File " + p.fileName + " has been modified!");
		console.log("(==) Current mtime: " + curr.mtime);
		console.log("(==) Previous mtime: " + prev.mtime);
		p.fs.readFile(p.fileName, 'utf8', function(err, data) {
			if(err) {
				console.log("(EE) " + err);
			} else {
				console.log("(II) File read successfully");
				p.parseFile(data);
			}
		});
	});

};

FileObserver.prototype.parseFile = function(data) {
	console.log("(II) Parsing file " + this.fileName);
	try {
		this.settings = new Array();
		var settings = JSON.parse(data).devices;
		console.log("(==) Numbers of devices registered: " + settings.length);
		for(var i = 0; i < settings.length; i++) {
			var device = settings[i];
			var sensor_array = new Array();

			for ( k=0;k<device.sensors.length;k++ ) {
				var current = device.sensors[k];
				sensor_array[current] = new Array();
 			}

 			var rules = device.rules;
 			for ( z=0; z<rules.length;z++ ) {
 				var current_rules = rules[z];

 				for (s=0;s<current_rules.sensor.length;s++) {
 					var current_sensor = current_rules.sensor[s];
 					var obj_rules= JSON.parse(JSON.stringify(current_rules));
 					delete obj_rules.sensor;
 					if(sensor_array[current_sensor] != undefined) {
 						sensor_array[current_sensor].push(current_rules);
 					} else {
 						console.log("(WW) Device: \"" + device.id + "\" | A rule for sensor \"" + current_sensor + "\" has been disabled");
 					}
 				}
 			}
 			var id = device.id;

 			this.settings[id] = sensor_array;
 		}

 		for(var i = 0; i < settings.length; i++) {
			var util = require('util');
			for(device in this.settings) {
				console.log("(==) Device: \"" + device + "\"");
				for(sensor in this.settings[device]) {
					console.log("(==) - Sensor: \"" + sensor + "\"");
					for(rule in this.settings[device][sensor]) {
						console.log("(==)   |- Rule #" + rule);
						for(entry in this.settings[device][sensor][rule]) {
							console.log("(==)      |- " + entry + ": " + util.inspect(this.settings[device][sensor][rule][entry], {showHidden: false, depth: null}));
						}
					}
				}
			}
		}
	} catch(e) {
		console.log("(EE) JSON Parse Error: " + e.stack);
		process.exit();
	}
};

FileObserver.prototype.setFileName = function(fName) {
	this.fileName = fName;
};

FileObserver.prototype.getFileName = function() {
	return this.fileName;
};

FileObserver.prototype.getSettings = function() {
	return this.settings;
};

module.exports = FileObserver;