//This function displays the modal popup for adding a new studen.
function displayModalPopup() {
  var backdropElem = document.getElementById('modal-backdrop');
  var ModalElem = document.getElementById('modal-popup');

  // Show the modal and its backdrop.
  backdropElem.classList.remove('hidden');
  ModalElem.classList.remove('hidden');
}

//This function displays the modal popup for adding a new studen.
function displayAddClassModalPopup() {
    var backdropElem = document.getElementById('modal-backdrop');
    var ModalElem = document.getElementById('modal-popup');

    // Show the modal and its backdrop.
    backdropElem.classList.remove('hidden');
    ModalElem.classList.remove('hidden');
}


/* This function closes the modal for adding a photo to a user page, clearing the values in its input elements. */
function closeModalPopup() {
  var backdropElem = document.getElementById('modal-backdrop');
  var ModalElem = document.getElementById('modal-popup');

  // Hide the modal and its backdrop.
  backdropElem.classList.add('hidden');
  ModalElem.classList.add('hidden');

  clearInputValues();
}


/* This function clears the values of all input elements in the modal. */
function clearInputValues() {
  var inputElems = document.getElementsByClassName('input-element');

  for (var i = 0; i < inputElems.length; i++) {
    var input = inputElems[i].querySelector('input');
    input.value = '';
  }
}


/* Small function to get a person's identifier from the current URL. */
function getUserIDFromLocation() {
  var pathComponents = window.location.pathname.split('/');

  if (pathComponents[0] !== '' && pathComponents[1] !== 'username') {
    return null;
  }

  return pathComponents[2];
}


/* This function uses Handlebars on the client side to generate HTML for a
 * person photo and adds that person photo HTML into the DOM. */
function addUser() {
    var userName = document.getElementById('name').value || '';
    var userPassword = document.getElementById('password').value || '';

    if (userName.trim() && userPassword.trim()) {
        storeUserInfo(userName, userPassword, function (err) {
            if (err) {
                // If we couldn't save the user information, alert the user.
                alert("Unable to save registration information. Got this error:\n" + err);
            } 
            else {
                clearInputValues();
                alert("User registration successfull. User is now able to log in.");
            }
        });
     
        closeModalPopup();
    }
    else {
        var msg = null;

        if (userName.trim().length == 0) {
            msg = 'Name field is required.\n';
        }

        if (userPassword.trim().length == 0) {
            msg = msg + 'Password field is required.'
        }

        if (msg != null) {
            alert(msg);
        }
    }
}


/* This function uses Handlebars on the client side to generate HTML for a
 * user class and adds that user class information HTML into the DOM. */
function addClass() {
    var className = document.getElementById('className').value || '';
    var classCreditHours = document.getElementById('classCreditHours').value || '';
    var classGrade = document.getElementById('classGrade').value || '';
    var userId = document.getElementById('UserId').value || '';
    var userName = document.getElementById('Username').value || '';


    if (className.trim() && classCreditHours.trim() && classCreditHours > 0 && classGrade.trim()) {
      
        storeUserClass(userId, className, classCreditHours, classGrade, function (err) {
            if (err) {
                // If we couldn't save the person photo, alert the user.
                alert("Unable to save user's class information. Got this error:\n" + err);
            }
            else {
                window.location.replace('/userdetails/' + userName);
                /*
                    * If we successfully saved the person photo, generate HTML for the
                    * new photo element and add it into the DOM.
                    */
                //var personPhotoTemplate = Handlebars.templates['person-photo'];
                //var personPhotoHTML = personPhotoTemplate({
                //    url: photoURL,
                //    caption: photoCaption
                //});

                //var mainElement = document.querySelector('main');
                //mainElement.insertAdjacentHTML('beforeend', personPhotoHTML);

            }
        });

        closeAddUserModal();
    }
    else {
        alert('Invalid or missing parameters.');
    }
}


function loginValidation() {
    var userName = document.getElementById('login-input-username').value || '';
    var userPassword = document.getElementById('login-input-password').value || '';

    if (userName.trim() && userPassword.trim()) {
        validateUserlogin(userName, userPassword, function (err) {
            if (err) {
                // If we couldn't save the user information, alert the user.
                alert(err);
                document.getElementById('login-input-username').value = "";
                document.getElementById('login-input-password').value = "";
                document.getElementById('login-input-username').focus();
            }
            else {
                //alert("User successfully logged in");
                document.getElementById('login-input-username').value = "";
                document.getElementById('login-input-password').value = "";
                window.location.replace('/userdetails/' + userName);
            }
        });
    }
    else {
        var msg = null;

        if (userName.trim().length == 0) {
            msg = 'Name field is required.\n';
        }

        if (userPassword.trim().length == 0) {
            msg = msg + 'Password field is required.'
        }

        if (msg != null) {
            alert(msg);
        }
    }
}


// JavaScript source code
function storeUserInfo(name, password, callback) {
    // We'll post to the add-photo endpoint for the appropriate person.
    var postUrl = '/user-add';

    // Start a new request to post our newly added class as JSON data.
    var postRequest = new XMLHttpRequest();
    postRequest.open('POST', postUrl);
    postRequest.setRequestHeader('Content-Type', 'application/json');

    /* Set up a simple handler for completed requests. This will send an error into the callback if we don't get a 200 (success) status back. */
    postRequest.addEventListener('load', function (event) {
        var error;

        if (event.target.status !== 200) {
            error = event.target.response;
        }

        callback(error);
    });

    // Send our user data off to the server.
    postRequest.send(JSON.stringify({
        name: name,
        password: password
    }));
}


// JavaScript source code
function validateUserlogin(name, password, callback) {
    // We'll post to the add-photo endpoint for the appropriate person.
    //alert('user name: ' + name + '\n user password: ' + password);

    var postUrl = '/validatelogin';

    //Start a new request to post our newly added class as JSON data.
    var postRequest = new XMLHttpRequest();
    postRequest.open('POST', postUrl);
    postRequest.setRequestHeader('Content-Type', 'application/json');

    /* Set up a simple handler for completed requests. This will send an error into the callback if we don't get a 200 (success) status back. */
    postRequest.addEventListener('load', function (event) {
        var error;

        if (event.target.status !== 200) {
            error = event.target.response;
        }

        callback(error);
    });

    // Send our user data off to the server.
    postRequest.send(JSON.stringify({
        name: name,
        password: password
    }));
}


// JavaScript source code
function storeUserClass(id, name, grade, credithours, callback) {

    // We'll post to the add-class endpoint for the appropriate person.
    var postUrl = '/userdetails/add-class/' + id;

    // Start a new request to post our newly added class as JSON data.
    var postRequest = new XMLHttpRequest();
    postRequest.open('POST', postUrl);
    postRequest.setRequestHeader('Content-Type', 'application/json');

    /*
     * Set up a simple handler for completed requests.  This will send an error
     * into the callback if we don't get a 200 (success) status back.
     */
    postRequest.addEventListener('load', function (event) {
        var error;
        if (event.target.status !== 200) {
            error = event.target.response;
        }
        callback(error);
    });

    // Send our class data off to the server.
    postRequest.send(JSON.stringify({
        className: name,
        grade: grade,
        credithours: credithours
    }));

}

console.log("Finnished");
// Wait until the DOM content is loaded to hook up UI interactions, etc.
window.addEventListener('DOMContentLoaded', function (event) {
	console.log("Finnished");
    var addUserButton = document.getElementById('add-user-button');

    if (addUserButton) {
        addUserButton.addEventListener('click', displayModalPopup);
    }

    var modalCloseButton = document.querySelector('#modal-popup .modal-close-button');

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeModalPopup);
    }

    var modalCancalButton = document.querySelector('#modal-popup .modal-cancel-button');

    if (modalCancalButton) {
        modalCancalButton.addEventListener('click', closeModalPopup);
    }

    var userInfoSave = document.getElementById('userinfosave');

    if (userInfoSave) {
        userInfoSave.addEventListener('click', addUser);
    }

    var classInfoSave = document.getElementById('classinfosave');

    if (classInfoSave) {
        classInfoSave.addEventListener('click', addClass);
    }

    var addClassButton = document.getElementById('add-class-button');

    if (addClassButton) {
        addClassButton.addEventListener('click', displayAddClassModalPopup);
    }

    var loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', loginValidation);
    }
});
