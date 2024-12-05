const db = require('../db');

class Class {
    static getAllClasses(callback) {
        const query = `
            SELECT classes.id, classes.name, classes.description, classes.credits, classes.teacher_id
            , users.first_name AS teacher_first_name, users.last_name AS teacher_last_name
            , (select count(*) from class_students where class_students.class_id = classes.id) as number_of_students
            FROM classes
            LEFT JOIN users ON classes.teacher_id = users.id
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static createClass({ name, description, credits, teacher_id }, callback) {
        const query = `INSERT INTO classes (name, description, credits, teacher_id) VALUES (?, ?, ?, ?)`;
        const values = [name, description, credits, teacher_id];

        db.query(query, values, (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    }
    
    static getClassById(id, callback) {
        const query = 'SELECT * FROM classes WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return callback(err);
            callback(null, result[0]); 
        });
    }
    
    static updateClassById = (id, { name, description, credits, teacher_id }, callback) => {
        const query = `UPDATE classes SET name = ?, description = ?, credits = ?, teacher_id = ? WHERE id = ?`;
        const values = [name, description, credits, teacher_id, id];

        db.query(query, values, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    };
    
    static deleteById(id, callback) {
        const query = 'DELETE FROM classes WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static assignStudentsToClass = (classId, studentIds, callback) => {
        // Delete existing students for the class
        const deleteQuery = 'DELETE FROM class_students WHERE class_id = ?';
        db.query(deleteQuery, [classId], (err) => {
            if (err) return callback(err);

            // Insert the new students
            const insertQuery = 'INSERT INTO class_students (class_id, student_id) VALUES ?';
            const values = studentIds.map(studentId => [classId, studentId]);

            db.query(insertQuery, [values], (err, result) => {
                if (err) return callback(err);
                callback(null, result);
            });
        });
    };
    
    static getAssignedStudents = (classId, callback) => {
        const query = 'SELECT student_id FROM class_students WHERE class_id = ?';
        db.query(query, [classId], (err, results) => {
            if (err) return callback(err);
            // Extract student IDs from the results
            const assignedStudentIds = results.map(row => row.student_id);
            callback(null, assignedStudentIds);
        });
    };
    
    static getClassesByTeacherId(teacher_id, callback) {
        const query = 'SELECT * FROM classes WHERE teacher_id = ?';
        db.query(query, [teacher_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
    
    static getClassesByStudentId(student_id, callback) {
        const query = 'SELECT * FROM classes WHERE id IN (SELECT class_id FROM class_students WHERE student_id = ?)';
        db.query(query, [student_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
}

module.exports = Class;
