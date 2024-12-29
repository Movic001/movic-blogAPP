const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'movic',
    password: 'admin',
    database: 'blog'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL server.');

    // Create the database if it doesn't exist
    db.query('CREATE DATABASE IF NOT EXISTS blog', (err, results) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database "blog" exists or was created.');

        // Switch to the blog database
        db.query('USE blog', (err, results) => {
            if (err) {
                console.error('Error selecting the database:', err.message);
                return;
            }

            // Create the blog table if it doesn't exist
            const createTable = `
                CREATE TABLE IF NOT EXISTS blog (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL
                );
            `;

            db.query(createTable, (err, results) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                } else {
                    console.log('Blog table created.');
                }
            });
        });
    });
});

// Export the database connection
module.exports = db;
