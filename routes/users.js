'use strict';

var express = require( 'express' );
var router = express.Router();
var auth = require( 'middleware/auth' );
var UserController = require( 'controllers/user-controller' );

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
|
| Routes that don't require JSON web token
| ----------------------------------------
| register
| request-reset-password
| reset-password-form/:resetToken
| login
|
| Routes that do require JSON web token
| -------------------------------------
| /
| me
| find/:id
| destroy
| reset-password
| update
| secure-update
| logout
|
*/

/* --------------------------------------------------------------------
   Unprotected Routes
   -------------------------------------------------------------------- */

// Register a new user.
router.post( '/register', UserController.register );

// Log user in.
router.post( '/login', UserController.login );

// Send email to reset password.
router.post('/request-reset-password', UserController.emailPasswordResetLink );

// Return HTML form for password reset.
router.get( '/reset-password-form/:resetToken', UserController.showPasswordResetForm );


/* --------------------------------------------------------------------
   Protected Routes
   -------------------------------------------------------------------- */

// Require the auth middleware; this is what makes the routes protected.
router.use( auth );

// Get an array of all the users.
router.get( '/', UserController.index );

// Get the logged in user.
router.get( '/me', UserController.me );

// Find a user by their id.
router.get( '/find/:id', UserController.find );

// Deletes the logged in user. Requires that they also supply their password.
router.post( '/destroy', UserController.destroy );

// Reset password via the password reset form.
router.post( '/reset-password', UserController.resetPassword );

// Handle non-sensitive updates.
router.put( '/update', UserController.update );

// Handle sensitive updates; require users to submit their password as well as being authenticated.
router.put( '/secure-update', UserController.secureUpdate );

// Log user out.
router.get( '/logout', UserController.logout );

module.exports = router;
