// Get the client
const mysql = require('mysql2')



function getConnection() {
  // Create the connection to database
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'crowdfunding_db',
  })

  connection.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('MySQL connected...');
  });

  return connection
}

module.exports = {
  getConnection
}
