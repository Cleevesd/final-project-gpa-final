var fs = require('fs');
var path = require('path');
var express = require('express');
var users = require('./users');
var app = express();
var port = process.env.PORT || 3000;

var profileTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'profile.html'), 'utf8');

// Serve static files from public/.
app.use(express.static(path.join(__dirname, 'public')));

/*
 * For the /users route, we dynamically build the content of the page using
 * the set of all available users by looping over the users and inserting
 * an HTML element representing each one.
 */
app.get('/users', function (req, res) {

  var content = "<html>";
  content += "<head>"
  content += "<meta charset='utf-8'>"
  content += "<title>Express Dynamic Content Demo - People</title>"
  content += "<link rel='stylesheet' href='/style.css'>"
  content += "</head>"
  content += "<body>"
  content += "<header>"
  content += "<h1>Users</h1>"
  content += "</header>"
  content += "<main>"

  Object.keys(users).forEach(function (person) {
    content += "<div class='person'>";
    content += "<p><a href='/users/" + person + "'>" + users[person].name + "</p>";
    content += "</div>";
  });

  content += "</main>"
  content += "</body>"
  content += "</html>";

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

    var content = profileTemplate;

    /*
     * Use regular expressions to replace our template patterns with the
     * actual info associated with the given person.
     */
    content = content.replace(new RegExp('{{name}}', 'g'), person.name);
    content = content.replace(new RegExp('{{course}}', 'g'), person.courses.course1.courseName);
    content = content.replace(new RegExp('{{grade}}', 'g'), person.courses.course1.grade);

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
