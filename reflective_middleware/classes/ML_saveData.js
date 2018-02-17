/*
*       ML_saveData Class
*/

var MongoDBAdapter  = require("./MongoDBAdapter.js");
function executeFunctionByName(functionName, context, args) {
	try {
		console.log("(II) Executing " + functionName + "(" + args + ")");
		var args = Array.prototype.slice.call(arguments, 2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for (var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(context, args);
	} catch(e) {
		console.log("(EE) Failed to reflective run the function " + functionName + ": " + e.stack);
	}
}


function getFileName(path) {
	var tmp = path.split("/");
	var file_name = tmp[tmp.length-1];	
	return file_name;
}




function ML_saveData(channel) {
	this.redis = require("redis");
	this.client = this.redis.createClient();
	this._channel = channel;	

	// Aggiunta
	this.chokidar = require('chokidar');
	this._directory = "plugins/";
	this.watcher = this.chokidar.watch(this._directory + "*Adapter*js", {ignored: /^\./, persistent: true});
	this.db_class = new Array();

	var parent = this;
	this.watcher.on('add', function(path) {
		
		try {
			console.log('(II) File', path, 'has been added');
			//var rePattern = new RegExp(/^Received:(.*)$/);
			var file_name = getFileName(path);
			var index_of_adapter = file_name.indexOf("Adapter");
			var class_name = file_name.substr(0, index_of_adapter);
			class_name = class_name.toLowerCase();
			var fs = require("fs");
			var content = fs.readFileSync('plugins/'+file_name.slice(0,-3)+".json");
			var parameters = JSON.parse(content);
			
			var a = require("../"+path);
			// username, password, db_name,host,port
			var b = new a(parameters);
			parent.db_class[parameters.class_name]= b;
			//console.log(parent.db_class);
		} catch(e) {
			console.log("(EE) Failed to open a file class or config file:" + e.stack);
		}
		
	});

	this.watcher.on('unlink', function(path) {
		try {
			console.log('(II) File', path, 'has been delted');
			var file_name = getFileName(path);
			var index_of_adapter = file_name.indexOf("Adapter");
			var class_name = file_name.substr(0, index_of_adapter);
			class_name = class_name.toLowerCase();
			var fs = require("fs");
			var content = fs.readFileSync('plugins/'+file_name.slice(0,-3)+".json");
			var parameters = JSON.parse(content);
			if (typeof parent.db_class[parameters.class_name] !== 'undefined') {
				console.log("(II) adapter deleted correctly ("+parameters.class_name+")");
				delete parent.db_class[parameters.class_name];
				
			} else {
				console.log("(WW) No Adapter found ("+parameters.class_name+")");
			}
		} catch(e) {
			console.log("(EE) Failed to open a file class or config file:" + e.stack);
		}

		
	})


}

ML_saveData.prototype.join = function() {
	this.client.subscribe(this._channel);
	return true;
};

ML_saveData.prototype.waitData = function() {
	var parent = this;
	this.client.subscribe(this._channel);

	this.client.on("message", function(channel, message){
		console.log("(II) Received message from REDIS - "+channel + ": " + message);
		var passing_data = JSON.parse(message);
		var data = passing_data.data;
		try {
			eval ("parent." + parent.db_class[passing_data.rule_where][passing_data.rule](data));
		} catch(e) {
			console.log("(EE) Failed to reflective run the function: parent." + parent.db_class[passing_data.rule_where]+" - "+e.stack);
		}
	});
};

module.exports = ML_saveData;