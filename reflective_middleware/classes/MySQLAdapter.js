/*
*       MySQLAdapter
*/

function MySQLAdapter(username, password, db_name,host,port) {
        this.mysql = require('mysql');
        this._host = host;
        this._port = port;
        this._db_name= db_name;
        this._password = password;
        this._username = username;
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