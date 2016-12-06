//This function displays the modal for adding a photo to a user page.
function displayModalPopup() {
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


/* This function clears the values of all input elements in the photo modal. */
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

  if (pathComponents[0] !== '' && pathComponents[1] !== 'userId') {
    return null;
  }

  return pathComponents[2];
}


/* This function uses Handlebars on the client side to generate HTML for a
 * person photo and adds that person photo HTML into the DOM. */
function insertNewUser() {
    var userName = document.getElementById('name').value || '';
    var userPassword = document.getElementById('password').value || '';

    if (userName.trim() && userPassword.trim()) {
        storeUserInfo(userName, userPassword, function (err) {
            if (err) {
                // If we couldn't save the user information, alert the user.
                alert("Unable to save user information. Got this error:\n\n" + err);
            } 
            else {
                alert("User information successfully saved");
            }
        });
     
        closeModalPopup();
    }
    else {
        var msg = null;

        if (userName.trim().length == 0) {
            msg = 'The Name field is required.\n';
        }

        if (userPassword.trim().length == 0) {
            msg = msg + 'The password field is required.'
        }

        if (msg != null) {
            alert(msg);
        }
    }
}


/* This function uses Handlebars on the client side to generate HTML for a
 * user class and adds that user class information HTML into the DOM. */
function insertNewUserClass() {
    var userclass = document.getElementById('userclass').value || '';
    var userClassGrade = document.getElementById('userclassgrade').value || '';

    if (photoURL.trim()) {
        var userId = getUserIDFromLocation();

        if (userId) {
            storePersonPhoto(personID, photoURL, photoCaption, function (err) {
                if (err) {
                    // If we couldn't save the person photo, alert the user.
                    alert("Unable to save user's class information. Got this error:\n\n" + err);
                }
                else {
                    /*
                     * If we successfully saved the person photo, generate HTML for the
                     * new photo element and add it into the DOM.
                     */
                    var personPhotoTemplate = Handlebars.templates['person-photo'];
                    var personPhotoHTML = personPhotoTemplate({
                        url: photoURL,
                        caption: photoCaption
                    });

                    var mainElement = document.querySelector('main');
                    mainElement.insertAdjacentHTML('beforeend', personPhotoHTML);

                }
            });
        }

        closeAddUserModal();
    }
    else {
        alert('You must specify a value for the "Name" field.');
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

                var postRequest = new XMLHttpRequest();
                postRequest.open('GET', '/users/' + userName);
                postRequest.send();

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


// Wait until the DOM content is loaded to hook up UI interactions, etc.
window.addEventListener('DOMContentLoaded', function (event) {
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
        userInfoSave.addEventListener('click', insertNewUser);
    }

    var classInfoSave = document.getElementById('classinfosave');

    if (classInfoSave) {
        classInfoSave.addEventListener('click', insertNewUserClass);
    }

    var addUserLink = document.getElementById('addnewuserlink');

    if (addUserLink) {
        addUserLink.addEventListener('click', displayModalPopup);
    }

    var loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', loginValidation);
    }
});
