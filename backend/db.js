const mysql = require('mysql2');
const config = require('./config');

let dbConnection = null;

function createConnection() {
    if (!dbConnection) {
        dbConnection = mysql.createConnection({
            host: config.db.host,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        dbConnection.connect((err) => {
            if (err) {
                console.error('Error connecting to the database: ', err);
            } else {
                console.log('Connected to the database');
            }
        });
    }

    return dbConnection;
}

module.exports = createConnection();
