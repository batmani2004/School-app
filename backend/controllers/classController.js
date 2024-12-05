const db = require('../db');
const Class = require('../models/class');
const User = require('../models/user');

exports.showCreateClassForm = (req, res) => {
    const query = "SELECT id, first_name, last_name FROM users WHERE role = 'teacher'";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching teachers.');
        }

        res.render('classes/create', {
            title: 'Create Class',
            teachers: results
        });
    });
};

exports.createClass = (req, res) => {
    const { name, description, credits, teacher_id } = req.body;

    // Validate the form inputs
    if (!name || !credits || !teacher_id) {
        return res.status(400).send('All fields are required.');
    }

    // Save the class to the database
    Class.createClass({ name, description, credits, teacher_id }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while creating the class.');
        }

        res.redirect('/classes');
    });
};

exports.editClass = (req, res) => {
    const classId = req.params.id; 

    // First, get the class data by its ID
    Class.getClassById(classId, (err, classData) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching class data');
        }

        // Then, get all teachers for the teacher select dropdown
        User.getTeachers((err, teachers) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching teacher data');
            }

            // Render the edit class page with the class data and teacher list
            res.render('classes/edit', { 
                title: 'Edit Class',
                class: classData,
                teachers: teachers
            });
        });
    });
};

exports.updateClass = (req, res) => {
    const { id } = req.params;
    const { name, description, credits, teacher_id } = req.body;

    // Ensure that all required fields are provided
    if (!name || !credits || !teacher_id) {
        return res.status(400).render('classes/edit', {
            title: 'Edit Class',
            errorMessage: 'All fields are required.',
            class: { id, name, description, credits, teacher_id }
        });
    }

    // Update the class in the database using the updateClassById method
    Class.updateClassById(id, { name, description, credits, teacher_id }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).render('classes/edit', {
                title: 'Edit Class',
                errorMessage: 'An error occurred while updating the class.',
                class: { id, name, description, credits, teacher_id }
            });
        }

        // If no rows were affected, class with the given ID was not found
        if (result.affectedRows === 0) {
            return res.status(404).render('classes/edit', {
                title: 'Edit Class',
                errorMessage: 'Class not found.',
                class: { id, name, description, credits, teacher_id }
            });
        }

        // Redirect to the classes page on success
        res.redirect('/classes');
    });
};

exports.deleteClass = (req, res) => {
    const { id } = req.params;

    Class.deleteById(id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "An error occurred while trying to delete the class." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: "Class not found." });
        }

        res.send({ message: "Class deleted successfully." });
    });
};

exports.getAssignStudentsPage = (req, res) => {
    const classId = req.params.id;

    Class.getClassById(classId, (err, classData) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching class data');
        }

        // Get the list of students (users with role 'student')
        User.getStudents((err, allStudents) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching students.');
            }
            
            Class.getAssignedStudents(classId, (err, assignedStudentIds) => {
                if (err) {
                    return res.status(500).send('Error retrieving assigned students');
                }

                // Map all students to include isAssigned property
                const students = allStudents.map(student => ({
                    ...student,
                    isAssigned: assignedStudentIds.includes(student.id),
                }));

                res.render('classes/students', {
                    title: 'Assign Students to Class',
                    class: classData,
                    students
                });
            });
        });
    });

    
};

exports.assignStudentsToClass = (req, res) => {
    const classId = req.params.id;
    const studentIds = req.body.student_ids;

    console.log(studentIds);

    if (!studentIds || studentIds.length === 0) {
        return res.status(400).send('At least one student must be selected.');
    }

    // Insert students into class_students table (assuming class_students is a join table)
    Class.assignStudentsToClass(classId, studentIds, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error assigning students to class.');
        }

        res.redirect(`/classes`);
    });
};
