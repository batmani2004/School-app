const User = require('../models/user'); // Import the User model

exports.signup = (req, res) => {
    const {first_name, last_name, email, password, confirm_password} = req.body;

    // Check if the passwords match
    if (password !== confirm_password) {
        return res.render('signup', {
            layout: 'auth',
            title: 'Signup',
            errorMessage: 'Passwords do not match',
            formData: {first_name, last_name, email}
        });
    }

    // Check if the user already exists
    User.findByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            return res.render('signup', {
                layout: 'auth',
                title: 'Signup',
                errorMessage: 'User already exists',
                formData: {first_name, last_name, email}
            });
        }

        // Create the new user
        User.createUser(first_name, last_name, email, password,'student', (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }

            const newUserId = results.insertId;

            // Retrieve the newly created user object
            User.getUserById(newUserId, (err, user) => {
                if (err) {
                    return res.status(500).send('Database error');
                }

                if (!user) {
                    return res.render('signup', {
                        layout: 'auth',
                        title: 'Signup',
                        errorMessage: 'Error retrieving user data',
                        formData: {first_name, last_name, email}
                    });
                }

                // Store the entire user object in the session
                req.session.user = user;

                // Redirect to the dashboard
                res.redirect('/');
            });
        });
    });
};

exports.login = (req, res) => {
    const {email, password} = req.body;

    // Validate email and password
    if (!email || !password) {
        return res.render('login', {
            layout: 'auth',
            title: 'Login',
            errorMessage: 'Please provide both email and password'
        });
    }

    // Find the user by email
    User.findByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            // No user found with this email
            return res.render('login', {
                layout: 'auth',
                title: 'Login',
                errorMessage: 'Invalid email or password'
            });
        }

        const user = results[0];

        // Check if the password matches
        if (user.password !== password) {
            return res.render('login', {
                layout: 'auth',
                title: 'Login',
                errorMessage: 'Invalid email or password',
                formData: {email}
            });
        }

        // Save the user in the session
        req.session.user = user;

        // Redirect to the dashboard
        res.redirect('/');
    });
};
