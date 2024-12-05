const db = require('../db');

class User {
    // Find a user by email
    static findByEmail(email, callback) {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Create a new user
    static createUser(first_name, last_name, email, password, role, callback) {
        const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [first_name, last_name, email, password, role], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    // Get a user by ID
    static getUserById(user_id, callback) {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [user_id], (err, results) => {
            if (err) return callback(err);
            // If no user found, return null
            if (results.length === 0) {
                return callback(null, null);
            }
            callback(null, results[0]);  // Return the first result (user)
        });
    }

    // Edit user information
    static editUser(user_id, first_name, last_name, email, password, callback) {
        let query;
        let values;
        
        if (password) {
            query = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?';
            values = [first_name, last_name, email, password, user_id];
        } else {
            query = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
            values = [first_name, last_name, email, user_id];
        }
        
        db.query(query, values, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static getAllUsers(callback) {
        const query = 'SELECT * FROM users';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static updateUserById(user_id, userData, callback) {
        const query = `
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, role = ? 
            WHERE id = ?
        `;
        const { first_name, last_name, email, role } = userData;

        db.query(query, [first_name, last_name, email, role, user_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static deleteById(user_id, callback) {
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [user_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    // Get all users with the role 'teacher'
    static getTeachers(callback) {
        const query = 'SELECT id, first_name, last_name FROM users WHERE role = "teacher"';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    // Get all users with the role 'student'
    static getStudents(callback) {
        const query = 'SELECT id, first_name, last_name FROM users WHERE role = "student"';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
}

module.exports = User;
