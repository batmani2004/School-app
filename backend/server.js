const express = require("express");
const bodyParser = require('body-parser');
const session = require("express-session");
const { engine } = require('express-handlebars');
const handlebars = require('handlebars');
const mysqlStore = require("express-mysql-session")(session);
const axios = require('axios');
const config = require('./config');

const app = express();

const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const classController = require('./controllers/classController');

const User = require('./models/user');
const Class = require('./models/class');

app.use(express.static(__dirname + "/../frontend"));

// Middleware to parse the body of POST requests
app.use(bodyParser.urlencoded({ extended: true })); // For form data
app.use(bodyParser.json()); // For JSON data

// MySQL session store configuration
const sessionStore = new mysqlStore({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

// Session middleware setup
app.use(session({
    key: 'user_sid',
    secret: config.sessionToken,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
        httpOnly: true
    }
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Set up default views folder
app.set('views', __dirname + '/../frontend/html');

// Set up html as the templating engine
app.set('view engine', 'html');
app.engine('html', engine({extname: 'html'}));

handlebars.registerHelper('ifNot', function (a, b) {
    return a !== b;
});

handlebars.registerHelper('ifEquals', function(a, b) {
    return a === b;
});

handlebars.registerHelper('ifOr', function(a, b) {
    return a || b;
});

handlebars.registerHelper('ifAnd', function(a, b) {
    return a && b;
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    res.redirect("/login");
};

// Add routes here
app.get("/login", (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    
    res.render('login', {
        layout: 'auth',
        title: 'Login'
    });
});

app.get('/signup', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    
    res.render('signup', {
        layout: 'auth',
        title: 'Signup'
    });
});

app.post('/signup', authController.signup);

app.post('/login', authController.login);

app.get("/", isAuthenticated, (req, res) => {
    const currentUser = req.session.user;
    
    if (currentUser.role === 'admin') {
        res.render('dashboard/admin', {
            title: 'Dashboard'
        });
    } else if (currentUser.role === 'teacher') {
        Class.getClassesByTeacherId(req.session.user.id, (err, classes) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('dashboard/teacher', {
                title: 'Dashboard',
                classes
            });
        });
    } else if (currentUser.role === 'student') {
        Class.getClassesByStudentId(req.session.user.id, (err, classes) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('dashboard/student', {
                title: 'Dashboard',
                classes
            });
        });
    }
});

app.post("/logout", isAuthenticated, (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", {
        title: "My Profile"
    });
});

app.post("/profile", isAuthenticated, userController.updateProfile);

app.get('/users', isAuthenticated, (req, res) => {
    User.getAllUsers((err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('users/show', {
            title: 'Users', 
            users 
        });
    });
});

app.get('/users/:id/edit', async (req, res) => {
    const userId = req.params.id;

    User.getUserById(userId, (err, user) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        if (!user) {
            console.log(err);
            return res.status(404).send('User not found');
        }

        res.render('users/edit', { 
            title: 'Edit User', 
            user
        });
    });
    
});

app.post("/users/:id/update", isAuthenticated, userController.updateUser);

app.post('/users/:id/delete', isAuthenticated, userController.deleteUser);

app.get('/users/create', (req, res) => {
    res.render('users/create', {
        title: 'Create New User'
    });
});

app.post('/users/create', isAuthenticated, userController.createUser);

app.get('/classes', isAuthenticated, (req, res) => {
    Class.getAllClasses((err, classes) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('classes/show', {
            title: 'Classes', 
            classes 
        });
    });
});

app.get('/classes/create', isAuthenticated, classController.showCreateClassForm);

app.post('/classes/create', isAuthenticated, classController.createClass);

app.get('/classes/:id/edit', isAuthenticated, classController.editClass);

app.post('/classes/:id/update', isAuthenticated, classController.updateClass);

app.post('/classes/:id/delete', isAuthenticated, classController.deleteClass);

app.get('/classes/:id/students', isAuthenticated, classController.getAssignStudentsPage);

app.post('/classes/:id/students', isAuthenticated, classController.assignStudentsToClass);

app.get('/weather', async (req, res) => {
    try {
        const response = await axios.get(config.weather.apiUrl, {
            params: {
                q: config.weather.city,
                appid: config.weather.apiKey,
                units: 'metric'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// Start the server
app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
