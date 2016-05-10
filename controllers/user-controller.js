/*
|--------------------------------------------------------------------------
| User Controller
|--------------------------------------------------------------------------
|
|  Private Methods
| ----------------
| _createToken
| 
|  Public Methods
| ---------------
| index
| me
| find
| destroy
| register
| login
| logout
| update
| secureUpdate
| emailPasswordResetLink
| showPasswordResetForm
| resetPassword
|
*/

'use strict';

var config = require( 'config' );
var jwt = require( 'jsonwebtoken' );
var Promise = require( 'bluebird' );
var crypto = require( 'crypto' );
var moment = require( 'moment' );
var sendgrid  = require( 'sendgrid' )( config.sendgrid.apiKey );
var requireParams = require( 'middleware/require-params' );
var User = require( 'models/User' );

class UserController {

	constructor () {

		// have to bind here bc => syntax doesn't seem to work in classes yet
		this.register = this.register.bind( this );
		this.login = this.login.bind( this );
		this.showPasswordResetForm = this.showPasswordResetForm.bind( this );

	}

	/**
	 * Creates a JWT token, which is used to authenticate subsequent requests.
	 * @param  {User} user   instance of User
	 * @return {Token}       a JWT token
	 */
	_createToken ( user ) {

		return jwt.sign( { user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

	}

	/**
	 * Return an array of all users.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
 	index ( req, res, next ) {

 		User.collection().fetch()

 			.then(( userCollection ) => {

 				const users = userCollection.models.map(( user ) => {

 					return user.publicAttributes;

 				});

 				return res.status( 200 ).json({ 

					success : true, 
					message : 'All the users!', 
					users   : users

				});

 			});

 	} 

 	/**
	 * Returns the currently logged in user.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
 	me ( req, res, next ) {

 		var decodedToken = req.decoded;
		var userId = decodedToken.user.id;

		User.where({ id : userId }).fetch()

			.then(( user ) => {

				return res.status( 200 ).json({

					success : true,
					message : 'User details',
					user    : user.publicAttributes

				});

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({ 

					success : false, 
					message : 'Could not find user in database.'

				});		

			});

 	}

 	/**
	 * Returns the user with the provided id.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	find ( req, res, next ) {

		User.where({ id : req.params.id }).fetch()

			.then(( user ) => {

				return res.status( 200 ).json({

					success : true,
					message : 'User details',
					user    : user.publicAttributes

				});

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({ 

					success : false, 
					message : 'Could not find user in database.'

				});		

			});

	} 

	/**
	 * Deletes the currently logged in user.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	destroy ( req, res, next ) {

		const requiredParamsStatus = requireParams( req, res, [ 'password' ]);

		if ( !requiredParamsStatus.success ) {

			return res.json( requiredParamsStatus );

		}

		var decodedToken = req.decoded;
		var userId = decodedToken.user.id;

		User.where({ id : userId }).fetch()

			.then(( user ) => {

				user.verifyPassword( req.body.password ).then(( verified ) => {

					if ( verified ) {

						user.destroy()

							.then(( userModel ) => {

								return res.status( 200 ).json({

									success : true,
									message : 'User deleted.'

								});

							});

						} else {

							return res.status( 422 ).json({ 

								success : false, 
								message : 'Passwords did not match.' 

							});
						}


					})

				.catch(( err ) => {

					console.error( err );

					return res.status( 500 ).json({ 

						success : false, 
						message : 'Unable to verify password.' 

					});

				});
				

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({ 

					success : false, 
					message : 'Could not find user in database.'

				});		

			});


	}

	/**
	 * Register a new user.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	register ( req, res, next ) {

		const requiredParamsStatus = requireParams( req, res, [ 'username', 'email', 'password' ]);

		if ( !requiredParamsStatus.success ) {

			return res.json( requiredParamsStatus );

		}

	  	var user = new User({

			username  : req.body.username,
			email     : req.body.email,
			password  : req.body.password,
			logged_in : true

		});

		user.save()

		.then(( user ) => {

			// log user in on register
			var token = this._createToken( user );

			return res.status( 200 ).json({ 

				success : true, 
				message : 'User successfully registered!', 
				user    : user.publicAttributes,
				token   : token 

			});

		})

		.catch(( err ) => {

			console.error( err );

			if ( err.code === 'ER_DUP_ENTRY' ) {

				res.statusCode = 409;

				return res.json({ 

					success : false, 
					message : 'User already exists.' 

				});	

			}

			res.statusCode = 500;

			return res.json({ 

				success : false, 
				message : 'Error saving user to database.' 

			});		

		});

	}

	/**
	 * Log user in.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	login ( req, res, next ) {

		const requiredParamsStatus = requireParams( req, res, [ 'email', 'password' ]);

		if ( !requiredParamsStatus.success ) {

			return res.json( requiredParamsStatus );

		}
	  
		User.where( { email : req.body.email } ).fetch()

			.then(( user ) => {

				user.verifyPassword( req.body.password )

				.then(( verified ) => {

					if ( verified ) {

						var token = this._createToken( user );

						user.set( 'logged_in', true );
						user.save();

						return res.json({ 

							success : true, 
							message : 'Login successful.', 
							user    : user.publicAttributes, 
							token   : token 

						});

					}

					return res.status( 422 ).json({ 

						success : false, 
						message : 'Passwords did not match.' 

					});

					
				})

				.catch(( err ) => {

					console.error( err );

					return res.status( 500 ).json({ 

						success : false, 
						message : 'Unable to verify password.' 

					});

				});

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({ 

					success : false, 
					message : `Could not find user with email ${req.body.email}` 

				});		

			});

	}

	/**
	 * Log user out.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	logout ( req, res, next ) {

		var decodedToken = req.decoded;
		var userId = decodedToken.user.id;

		User.where({ id : userId }).fetch()

			.then(( user ) => {

				return user.logout();

			})

			.then(( user ) => {

				return res.json({

					success : true,
					message : 'Successfully logged out.'

				});

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({ 

					success : false, 
					message : 'Could not find user in database.'

				});		

			});

	}

	/**
	 * Update user.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	update ( req, res, next ) {

		let count = 0;

		// check there's something to update
		User.updateableAttributes.forEach(( attribute ) => {

			if ( !!req.body[ attribute ] ) {

				count++;

			}

		});
		
		if ( count === 0 ) {

			return res.status( 422 ).json({

				success : false,
				message : 'No updateable attributes provided'

			});

		}

		var decodedToken = req.decoded;
		var userId = decodedToken.user.id;

		var updates = {};

		User.where({ id : userId }).fetch()

			.then(( user ) => {

				User.updateableAttributes.forEach(( attribute ) => {

					if ( !!req.body[ attribute ] ) {

						var previous = user.get( attribute );
						user.set( attribute, req.body[ attribute ] );

						updates[ attribute ] = { previous : previous, current : req.body[ attribute ] };

					}

				});

				return user.save();

			})

			.then(( user ) => {

				var userAttributes = Object.assign({}, user.publicAttributes, { updates : updates });

				return res.status( 200 ).json({

					success : true,
					message : 'Updated',
					user    : userAttributes

				});

			})

			.catch(( err ) => {

				console.error( err );

				return res.status( 404 ).json({

					success : false,
					message : 'User not found.'

				});

			});

	}

	/**
	 * Update sensitive user attributes, e.g. email and password.  
	 * Ask for their current password for extra security.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	secureUpdate ( req, res, next ) {

		const requiredParamsStatus = requireParams( req, res, [ 'password' ]);

		if ( !requiredParamsStatus.success ) {

			return res.json( requiredParamsStatus );

		}

		let count = 0;

		// check there's something to update
		User.securelyUpdateableAttributes.forEach(( attribute ) => {

			if ( !!req.body[ attribute ] ) {

				count++;

			}

		});
		
		if ( count === 0 ) {

			return res.status( 422 ).json({

				success : false,
				message : 'No updateable attributes provided'

			});

		}

		var decodedToken = req.decoded;
		var userId = decodedToken.user.id;

		var updates = {};

		User.where({ id : userId }).fetch()

			.then(( user ) => {

				user.verifyPassword( req.body.password ).then(( verified ) => {

					if ( verified ) {

						User.securelyUpdateableAttributes.forEach(( attribute ) => {

							if ( !!req.body[ attribute ] ) {

								if ( attribute === 'new_password' ) {

									// don't bother sending back in response
									user.set( 'password', req.body[ 'new_password' ] );

								} else {

									var previous = user.get( attribute );
									user.set( attribute, req.body[ attribute ] );

									updates[ attribute ] = { previous : previous, current : req.body[ attribute ] };

								}

							}

						});

						return user.save()

					} else {

						return res.status( 422 ).json({ 

							success : false, 
							message : 'Passwords did not match.' 

						});

					}

					
				})

				.then(( user ) => {

					var userAttributes = Object.assign({}, user.publicAttributes, { updates : updates });

					return res.status( 200 ).json({

						success : true,
						message : 'Updated',
						user    : userAttributes

					});

				})

				.catch(( err ) => {

					console.error( err );

					return res.status( 500 ).json({ 

						success : false, 
						message : 'Unable to verify password.' 

					});

				});

			});

	}

	/**
	 * Send an email with a link to the password reset form.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a JSON response with appropriate headers.
	 */
	emailPasswordResetLink ( req, res, next ) {

		User.where({ email : req.body.email }).fetch()

			.then(( user ) => {

				return new Promise(( resolve, reject ) => {

					crypto.randomBytes( 20, ( err, buf ) => {

						if ( err ) {

							reject( err );

						}

						var resetToken = buf.toString( 'hex' );
						resolve({ resetToken : resetToken, user : user });

					});

				})

				.then(( data ) => {

					var user = data.user;
					var resetToken = data.resetToken;

					var expires = moment().add( 1, 'hours' ).format( 'YYYY-MM-DD HH:mm:ss' );  

					user.set({

						'reset_password_token'   : resetToken, 
						'reset_password_expires' : expires

					});

					return user.save();

				})

				.then(( user ) => {

					var url = `http://${req.headers.host}/users/reset-password-form/${user.get( 'reset_password_token' )}`;

					var payload = config.sendgrid.passwordReset( 

						user.get( 'email' ), 
						user.get( 'reset_password_expires' ), 
						url

					);

					sendgrid.send( payload, ( err, json ) => {

						if ( err ) { 

							console.error(err); 

						}

						console.log(json);

					});

					return res.json({ 

						success : true,
						message : 'Email sent.' 

					});

				});

			})

			.catch(( err ) => {

				console.error( err );

				res.json({ 

					success : false, 
					message : 'User not found.' 

				});		

			});

	}

	/**
	 * Show the password reset form.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a HTML page with a form.
	 */
	showPasswordResetForm ( req, res, next ) { // todo : at some point this will be hosted elsewhere

		User.where({ 'reset_password_token' : req.params.resetToken }).fetch()

			.then(( user ) => {

				if ( user.passwordResetTokenIsValid() ) {

					user.set({ 'reset_password_token' : null, 'reset_password_expires' : null });
					var token = this._createToken( user );

					res.locals.user = user.publicAttributes;
					res.locals.token = token;

					return res.render( 'reset-password-form' );

				}

				user.set({ 'reset_password_token' : null, 'reset_password_expires' : null });

				return res.json({ 

					success : false, 
					message : 'Password reset has expired.' 

				});


			})

			.catch(( err ) => {

				console.error( err );

				return res.json({ 

					success : false, 
					message : 'Password reset is invalid.' 

				});

			});

	}

	/**
	 * Reset the user's password and return success page.
	 * 
	 * @param  {Object}   req   Request
	 * @param  {Object}   res   Response
	 * @param  {Function} next  Pass to next piece of middleware
	 * @return {JSON}           Return a HTML page with a message saying the password has been reset.
	 */
	resetPassword ( req, res, next ) {

		if ( req.body.password.trim() === '' ) {

			return res.json({

				success : false,
				message : 'Password can\'t be blank.'

			});

		}

		User.where({ id : req.body.id }).fetch()

			.then(( user ) => {

				user.set( 'password', req.body.password );
				user.save()
					.then(( user ) => {

						return res.render( 'reset-password-success' );

					});

			});

	}

}

module.exports = new UserController();