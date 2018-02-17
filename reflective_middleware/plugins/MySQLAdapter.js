/*
*       MySQLAdapter
*/

function MySQLAdapter(parameters) {
        this.mysql = require('mysql');
        this._host = parameters.host;
        this._port = parameters.port;
        this._db_name= parameters.db_name;
        this._password = parameters.password;
        this._username = parameters.username;
        this.connection = null;
}

MySQLAdapter.prototype.connect = function() {
        var username = this._username;
        var password = this._password;
        var db_name = this._db_name;
        var port = this._port;
        var host = this._host;
        this.connection = this.mysql.createConnection({
                host : host,
                user     : username,
                password : password,
                database : db_name
        });
        if (!this.connection) {
                console.log("Connection error");
                return false;
        } else {
                return true;
        }
}


MySQLAdapter.prototype.insert = function (table,data) {
        var query = this.connection.query('INSERT INTO '+ table +' SET ?', data,function(error) {
                console.log(query);
                if (error) {
                        console.log(error.message);
                        return false;
                } else {
                        //console.log('success');
                        return true;
                }
        });

}

MySQLAdapter.prototype.closeConnection = function () {
        this.connection.end();

}

MySQLAdapter.prototype.write = function(data) {
        var connection = this.connect();
        this.insert("data",data);
        this.closeConnection();
};

module.exports = MySQLAdapter;