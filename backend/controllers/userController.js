const User = require('../models/user');

exports.updateProfile = (req, res) => {
    const {first_name, last_name, email, password, confirm_password} = req.body;

    if (password && password !== confirm_password) {
        return res.render("profile", {
            layout: "main",
            title: "Edit Profile",
            currentUser: req.session.user,
            errorMessage: "Passwords do not match!"
        });
    }

    User.editUser(req.session.user.id, first_name, last_name, email, password, (err, results) => {
        if (err) {
            console.log(err);
            return res.render("profile", {
                layout: "main",
                title: "Edit Profile",
                currentUser: req.session.user,
                errorMessage: "An error occurred while updating your profile. Please try again."
            });
        }
        
        // Retrieve the newly created user object
        User.getUserById(req.session.user.id, (err, user) => {
            if (err) {
                return res.status(500).send('Database error');
            }

            if (!user) {
                console.log(err);
                return res.render('signup', {
                    layout: 'auth',
                    title: 'Signup',
                    errorMessage: 'Error retrieving user data'
                });
            }

            req.session.user = user;

            res.render("profile", {
                title: "Edit Profile",
                currentUser: req.session.user,
                successMessage: "Profile updated successfully!"
            });
        });
    });
};

exports.updateUser = (req, res) => {
    const {id} = req.params;
    const { first_name, last_name, email, role, password, confirm_password } = req.body;

    if (!first_name || !last_name || !email || !role) {
        return res.status(400).render('users/edit', {
            title: 'Edit User',
            errorMessage: 'These fields are required: First Name, Last Name, Email, Role.',
            user: { id, first_name, last_name, email, role }
        });
    }
    
    if (password && password !== confirm_password) {
        return res.status(400).render('users/edit', {
            title: 'Edit User',
            errorMessage: 'Passwords do not match!',
            user: { id, first_name, last_name, email, role }
        });
    }

    // Update the user
    User.updateUserById(id, { first_name, last_name, email, role, password }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).render('users/edit', {
                title: 'Edit User',
                errorMessage: 'An error occurred while updating the user.',
                user: { id, first_name, last_name, email, role }
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).render('users/edit', {
                title: 'Edit User',
                errorMessage: 'User not found.',
                user: { id, first_name, last_name, email, role }
            });
        }

        User.getUserById(id, (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).render('users/edit', {
                    title: 'Edit User',
                    errorMessage: 'An error occurred while retrieving the updated user.',
                    user: { id, first_name, last_name, email, role }
                });
            }

            if (!user) {
                return res.status(404).render('users/edit', {
                    title: 'Edit User',
                    errorMessage: 'User not found after update.',
                    user: { id, first_name, last_name, email, role }
                });
            }

            res.render('users/edit', {
                title: 'Edit User',
                successMessage: 'User updated successfully!',
                user
            });
        });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;

    if (req.session.user && parseInt(req.session.user.id) === parseInt(id)) {
        return res.status(400).send({ error: "You cannot delete your own account." });
    }

    User.deleteById(id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "An error occurred while trying to delete the user." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: "User not found." });
        }

        res.send({ message: "User deleted successfully." });
    });
};

exports.createUser = (req, res) => {
    const { first_name, last_name, email, role, password, confirm_password } = req.body;

    // Validate form inputs
    if (!first_name || !last_name || !email || !role || !password || !confirm_password) {
        return res.render('users/create', {
            title: 'Create New User',
            errorMessage: 'All fields are required.',
            formData: {first_name, last_name, email, role}
        });
    }

    if (password !== confirm_password) {
        return res.render('users/create', {
            title: 'Create New User',
            errorMessage: 'Passwords do not match.',
            formData: {first_name, last_name, email, role}
        });
    }

    // Create user in the database
    User.createUser(first_name, last_name, email, password, role, (err, result) => {
        if (err) {
            console.error(err);
            return res.render('users/create', {
                title: 'Create New User',
                errorMessage: 'An error occurred while creating the user.',
                formData: {first_name, last_name, email, role}
            });
        }

        res.redirect('/users'); // Redirect to the users list after successful creation
    });
};
