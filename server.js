var path = require('path');
var express = require('express');
var Handlebars = require('handlebars');
var exphbs = require('express-handlebars');
var users = require('./private/users');

var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
var port = process.env.PORT || 3000;

/* Read info about the MySQL connection from the environment and use it to
 * make the connection. */
var mysqlHost = process.env.MYSQL_HOST;
var mysqlUser = process.env.MYSQL_USER;
var mysqlPassword = process.env.MYSQL_PASSWORD;
var mysqlDB = process.env.MYSQL_DB;

var mysqlConnection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: 'web_user',
    password: '',
    database: 'grade_calculator'
});

// Use Handlebars as the view engine for the app.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars');

// Parse all request bodies as JSON.
app.use(bodyParser.json());

// Serve static files from public/.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/views'));

// Render the index page for the root URL path ('/').
app.get('/', function (req, res) {
    res.render('index-page', {
        pageTitle: 'GPA Calculator'
    });
});

app.get('/home', function (req, res) {
    res.render('index-page', {
        pageTitle: 'GPA Calculator'
    });
});


/* For the /users route, we dynamically build the content of the page using
 * the set of all available users by looping over the users and inserting
 * an HTML element representing each one. */
app.get('/userlist', function (req, res) {
    /* Initiate a database query for all of our people in the database.  We'll
     * respond to the requesting client from within the callback of the MySQL
     * query. */
    mysqlConnection.query('SELECT * FROM user', function (err, rows) {
        if (err) {
            /* Send an error response if there was a problem fetching the people
             * from the DB.*/
            console.log("== Error fetching users from database:", err);
            res.status(500).send("Error fetching users from database: " + err);
        } 
        else {
            /* If we successfully fetched the people, use the data fetched from the
             * DB to build an array to pass to Handlebars for rendering, and then
             * do the rendering. */
            var users = [];

            rows.forEach(function (row) {
                users.push({
                    id: row.id,
                    name: row.name,
                    password: row.password
                });
            });

            res.render('user-list', {users: users,
                pageTitle: 'Registered Users List'
            });
        }
    });

});


/* Here, we use a dynamic route to create a page for each user.  We use
 * Express machinery to get the requested user from the URL and then fill
 * in a template with that user's info. */
app.get('/userdetails/:username', function (req, res, next) {
    var userName = req.params.username;

    if (userName) {
        mysqlConnection.query('SELECT * FROM user where name=?', [userName], function (err, rows) {
            if (err) {
                /* Send an error response if there was a problem fetching the people
                 * from the DB.*/
                console.log("== Error fetching user from database:", err);
                res.status(500).send("Error fetching user from database: " + err);
            }
            else if (rows.length >= 1) {
                /* If we successfully fetched the people, use the data fetched from the
                 * DB to build an array to pass to Handlebars for rendering, and then
                 * do the rendering. */
                var user = rows[0];

                /* If we got at least one row (should be exactly 1), then we found the
                 * requested person.  Fetch that person's photos as well. */
                mysqlConnection.query('SELECT * FROM class WHERE userid = ?', [user.id], function (err, rows) {
                    if (err) {
                        /* Send an error response if there was a problem fetching the classes
                         * from the DB. */
                        console.log("== Error fetching classes for user (", userName, ") from database:", err);
                        res.status(500).send("Error fetching classes from database: " + err);
                    } 
                    else {
                        /* Put each of the photos we fetched from the DB into an array to
                         * be passed along to Handlebars. */
                        var classes = [];
                        var allGrades = 0;
                        var totalCredithours = 0;
                        var Gpa = 0;

                        rows.forEach(function (row) {
                            classes.push({
                                name: row.name,
                                grade: row.grade,
                                credithours: row.credithours
                            });
                            allGrades = allGrades + (row.credithours * row.grade);
                            totalCredithours = totalCredithours + row.credithours;
                        });
                        console.log('allgrades is:' + allGrades);
                        console.log('credithours is:' + totalCredithours);
                        Gpa= allGrades / totalCredithours;
                        Gpa = Gpa.toFixed(2);
                        // Render the page, sending all the needed info to Handlebars.
                        res.render('user-details', {
                            pageTitle: 'Student Details',
                            user: {
                                id: user.id,
                                name: user.name,
                                classes: classes,
                                gpa: Gpa
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        // If we don't have info for the requested person, fall through to a 404.
        next();
    }
});

app.post('/user-add', function (req, res, next) {
    /* If the POST body contains a class name, then add the new user to the
    * DB and respond with success.  Otherweise, let the client know they made a bad request. */
    if (req.body) {
        mysqlConnection.query(
            'INSERT INTO user (name, password) VALUES (?, ?)',
            [req.body.name, req.body.password],
            function (err, result) {
                if (err) {
                    /* Send an error response if there was a problem inserting the user
                    * information into the DB. */
                    console.log("== Error inserting user information into database:", err);
                    res.status(500).send("Error inserting user information into database: " + err);
                }

                res.status(200).send();
        });
    } 
    else {
        res.status(500).send("Missing or invalid parameter.");
    }
});


app.post('/userdetails/add-class/:userid', function (req, res, next) {
    /* If the POST body contains a class name, then add the new user to the
    * DB and respond with success.  Otherweise, let the client know they made a bad request. */

    if (req.body) {
        mysqlConnection.query(
            'INSERT INTO class (name, grade, credithours, userid) VALUES (?, ?, ?, ?)',
            [req.body.className, req.body.credithours, req.body.grade, req.params.userid],
            function (err, result) {
                if (err) {
                    /* Send an error response if there was a problem inserting the user
                    * information into the DB. */
                    console.log("== Error inserting Class information:", err);
                    res.status(500).send("Error inserting Class information: " + err);
                }

                res.status(200).send();
            });
    }
    else {
        res.status(500).send("Missing or invalid parameter.");
    }
});





app.post('/validatelogin', function (req, res, next) {
    var sql;

    /* If the POST body contains a class name, then add the new class to the user's classes in the DB and respond with success. Otherweise, let the client know they made a bad request. */
    if (req.body && req.body.name && req.body.password) {
        sql = "SELECT * FROM user where name = '" + req.body.name + "' and password = '" + req.body.password + "'";

        mysqlConnection.query(sql, function (err, rows) {
            if (err) {
                /* Send an error response if there was a problem fetching the record from the DB.*/
                console.log("== Error fetching user from database:", err);
                res.status(500).send("Error fetching user from database.");
            }
            else if (rows.length == 1) {
                /* If we successfully fetched the people, use the data fetched from the DB to build an array to pass to Handlebars for rendering, and then do the rendering. */
                var user = rows[0];

                sql = "SELECT * FROM class WHERE userid = " + user.id;

                mysqlConnection.query(sql, function (err, rows) {
                    if (err) {
                        /* Send an error response if there was a problem fetching the classes
                         * from the DB. */
                        console.log("== Error fetching classes for user (", req.params.userId, ") from database:", err);
                        res.status(500).send("Error fetching classes from database: " + err);
                    }
                    else {
                        /* Put each of the photos we fetched from the DB into an array to
                         * be passed along to Handlebars. */
                        var classes = [];

                        rows.forEach(function (row) {
                            classes.push({
                                name: row.name,
                                grade: row.grade
                            });
                        });

                        res.status(200).send();
                    }
                });
            }
            else {
                res.status(500).send("Invalid user name or password.");
            }
        });

    }
    else {
        res.status(500).send("Missing or invalid parameter.");
    }
});




// If we didn't find the requested resource, send a 404 error.
app.get('*', function(req, res) {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});




// Listen on the specified port.
app.listen(port, function () {
    console.log("== Listening on port", port);
});


