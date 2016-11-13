var fs = require('fs');
var path = require('path');
var express = require('express');
var Handlebars = require('handlebars');
var users = require('./users');
var app = express();
var port = process.env.PORT || 3000;

var profileTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'profile.html'), 'utf8');
var profileTemplate = Handlebars.compile(profileTemplateSource);

var usersTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'users.html'), 'utf8');
var usersTemplate = Handlebars.compile(usersTemplateSource);
// Serve static files from public/.
app.use(express.static(path.join(__dirname, 'public')));

/*
 * For the /users route, we dynamically build the content of the page using
 * the set of all available users by looping over the users and inserting
 * an HTML element representing each one.
 */
app.get('/users', function (req, res) {

var content = usersTemplate({users: users})

  res.send(content);

});

/*
 * Here, we use a dynamic route to create a page for each person.  We use
 * Express machinery to get the requested person from the URL and then fill
 * in a template with that person's info.
 */
app.get('/users/:user', function (req, res, next) {

  var person = users[req.params.user];

  if (person) {

    var content = profileTemplate(person);

    /*
     * Use regular expressions to replace our template patterns with the
     * actual info associated with the given person.
     */
    res.send(content);

  } else {

    // If we don't have info for the requested person, fall through to a 404.
    next();

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
