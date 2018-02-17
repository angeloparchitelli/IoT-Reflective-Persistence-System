/*
*       MongoDBAdapter
*/

function MongoDBAdapter(parameters) {
    this.MongoClient = require('mongodb').MongoClient;
    this.ObjectId = require('mongodb').ObjectID;
    this.port = parameters.port;
    this.collection = parameters.collection;
    this.database = parameters.db_name;
    this.host = parameters.host;
    this.url = 'mongodb://'+this.host+':'+this.port+'/'+this.database;
}

MongoDBAdapter.prototype.insert = function(data) {
    var collection = this.collection;
    try {
        this.MongoClient.connect(this.url, function(err, db) {
                db.collection(collection).insertOne(data);
                db.close();
        });    
    } catch (e) {
        console.log("(EE) MongoDB Adapter insert error: "+e.stack);
    }
        
}

MongoDBAdapter.prototype.write = function(data) {
    this.insert(data);
};

module.exports = MongoDBAdapter;