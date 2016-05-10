'use strict';

process.env.NODE_ENV = 'test';

var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var knex = require( 'db' ).knex;
var api = supertest( 'http://localhost:3000' );

describe( '/users', () => {

	let token = null;

	before(( done ) => {

		return knex.migrate.rollback()
			.then(() => knex.migrate.latest())
			.then(() => done());

	});

	describe( '/register', () => {

		var test = require( './routes/users/register' );

		it( 'returns JSON response saying missing params are required', test.missingParams );
		it( 'saves user to database, logs user in and returns JSON response with a token', test.register );
		it( 'returns JSON response saying the user already exists', test.userAlreadyExists );

		// todo : simulate db failure

	});

	describe( 'index', () => {

		var test = require( './routes/users/index' );

		it( 'returns JSON array of all the users', test.index );
		it( 'says you need a token', test.noToken );

	});

	describe( 'me', () => {

		var test = require( './routes/users/me' );

		it( 'returns the logged in user', test.me );
		it( 'says you need a token', test.noToken );

	});

	describe( 'find', () => {

		var test = require( './routes/users/find' );

		it( 'returns the user with id provided', test.find );
		it( 'says you need a token', test.noToken );

	});

	describe( 'destroy', () => {

		var test = require( './routes/users/destroy' );

		it( 'returns the user with id provided', test.destroy );
		it( 'says you need a token', test.noToken );
		it( 'says you gave the wrong password', test.wrongPassword );

	});

	describe( '/login', () => {

		var test = require( './routes/users/login' );

		it( 'returns JSON response saying missing params are required', test.missingParams );
		it( 'returns JSON response saying the user could not be found', test.userDoesNotExist );
		it( 'returns JSON response saying the user has given the wrong password', test.wrongPassword );
		it( 'logs in the user and returns a token', test.login );

	});

	describe( '/logout', () => {

		var test = require( './routes/users/logout' );

		it( 'logs the user out', test.logout );
		it( 'says the user isn\'t authenticated', test.noToken );

	});

	describe( '/update', () => {

		var test = require( './routes/users/update' );

		it( 'updates the user\'s details', test.update );
		it( 'says no updateable params have been provided', test.noParams );
		it( 'says the user hasn\'t got a valid token', test.noToken ); 
		it( 'says the user doesn\'t exist', test.userDoesNotExist );

	});

	describe( '/secure-update', () => {

		var test = require( './routes/users/secure-update' );

		it( 'updates the user\'s details', test.secureUpdate );
		it( 'says the user gave the wrong password', test.wrongPassword );
		// it( 'says the user hasn\'t got a valid token', test.noToken ); 
		// it( 'says the user can\'t update another user', test.differentUser );
		// it( 'says the user doesn\'t exist', test.userDoesNotExist );

	});

	

	after(( done ) => {

		return knex.migrate.rollback()
			.then(() => done());

	});

});

