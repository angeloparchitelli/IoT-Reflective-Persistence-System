
console.log("=========================================");
console.log("*** IoT Reflective Persistence System ***");
console.log("=========================================");
console.log("\n");
var Server = require("./classes/Server");
var ML_saveData = require("./classes/ML_saveData.js");
var s = new Server('0.0.0.0', 8080);
var p = new ML_saveData("iot-data");
s.fileObserver.observe();
s.create();
s.listen();
p.join();
p.waitData();