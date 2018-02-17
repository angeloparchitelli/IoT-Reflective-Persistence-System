/*
*       MongoDBAdapter
*/

function MongoDBAdapter(url,port,database,collection) {
        this.MongoClient = require('mongodb').MongoClient;
        this.assert = require('assert');
        this.ObjectId = require('mongodb').ObjectID;
        this.port = port;
        this.collection = collection;
        this.database = database;
        this.url = 'mongodb://'+url+':'+this.port+'/'+this.database;
}

MongoDBAdapter.prototype.insert = function(data) {
        var collection = this.collection;
        this.MongoClient.connect(this.url, function(err, db) {
                db.collection(collection).insertOne(data);
                db.close();
        });
}

MongoDBAdapter.prototype.write = function(data) {
        this.insert(data);
};

module.exports = MongoDBAdapter;