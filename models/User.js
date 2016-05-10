'use strict';

// Dependencies
var bookshelf = require('../db').bookshelf;
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var moment = require('moment');

/*
|--------------------------------------------------------------------------
| User Model
|--------------------------------------------------------------------------
|
|
*/

class User extends bookshelf.Model {

	constructor ( props ) {

		super( props );

		// hash password whenever a new user is created / updated
		this.on( 'creating', this.hashPassword, this );
		this.on( 'updating', this.hashPassword, this );

		// convert binary to boolean when retrieving user
		this.on( 'fetched', this.castLoggedInAttributeToBoolean, this )

	}

	get tableName () { return 'users'; }
	get hasTimestamps () { return true; }
	get idAttribute () { return 'id'; }

	// don't keep sending password back and forth
	get publicAttributes () {

		return {

			id         : this.get( 'id' ),
			username   : this.get( 'username' ),
			email      : this.get( 'email' ),
			logged_in  : this.get( 'logged_in' ),
			created_at : this.get( 'created_at' ),
			updated_at : this.get( 'updated_at' ),

		};

	}

	/* --------------------------------------------------------------------
	   Instance Methods
	   -------------------------------------------------------------------- */

	/**
     * Hash the password when saving to the database.
     *
     * @param Object, @param Object, @param Object 
     * 
     * @return Promise
	 *	  @reject Error, @resolve User
     */
	hashPassword ( model, attrs, options ) {

		if (!model.changed.password) {

			return new Promise(( resolve, reject ) => resolve( model ));

		}

		return new Promise(( resolve, reject ) => {

			bcrypt.hash( model.get( 'password' ), 10, ( err, hash ) => {

				if ( err ) {
					reject( err );
				}

				model.set( 'password', hash );

				resolve( model );

			});

		});

	}

	/**
     * Compare the supplied password with the hashed stored password.
     *
     * @param String
     * 
     * @return Promise
	 *	  @reject Error, @resolve Boolean
     */
	verifyPassword ( suppliedPassword ) {

		const storedPassword = this.get( 'password' );

		return new Promise(( resolve, reject ) => {

			bcrypt.compare( suppliedPassword, storedPassword, ( err, res ) => {

				if ( err ) {
					reject( err );
				}

				resolve( res );

			});

		});

	}

    /**
     * Convert logged_in property from 1 / 0 to true / false.
     *
     * @param Object, @param Object, @param Object 
     * 
     * @return void
     */
	castLoggedInAttributeToBoolean ( model, attrs, options ) {

		const loggedIn = model.get( 'logged_in' ) === 1 ? true : false;
		model.set( 'logged_in', loggedIn );

	}

	/**
     * Update user logged_in status to false.
     * 
     * @return Promise
     *	  @reject Error, @resolve User
     */
	logout () {

		this.set( 'logged_in', false );
		return this.save();

	}

	/**
     * Update user logged_in status to true.
     * 
     * @return Promise
     *	  @reject Error, @resolve User
     */
	login () {

		this.set( 'logged_in', true );
		return this.save();

	}

	passwordResetTokenIsValid () {

		return moment( this.get( 'reset_password_expires' ) ).isAfter( moment() );

	}

	/* --------------------------------------------------------------------
	   Class Methods
	   -------------------------------------------------------------------- */

	   static get updateableAttributes () {

	   		return [ 'username' ];

	   }

	   static get securelyUpdateableAttributes () {

	   		return [ 'email', 'new_password' ];

	   }


}

module.exports = User;