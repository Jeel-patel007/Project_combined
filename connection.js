const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root_123",
    database: "project",
});

function ExecuteData(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, elements) => {
            if (error) {

                return reject(error);
            }
            else {
                console.log('data fetched');
                return resolve(elements);
            }

        });
    });
};

module.exports = { connection, ExecuteData }