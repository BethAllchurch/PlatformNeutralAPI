'use strict';

process.env.NODE_ENV = 'test';

var app = require( '../app' );
var expect = require( 'chai' ).expect;
var User = require( 'models/User' );
var knex = require( 'db' ).knex;

describe( 'User Model', () => {

	before(( done ) => {

		return knex.migrate.rollback()
			.then(() => knex.migrate.latest())
			.then(() => done());

	});

	it( 'should not have any models', ( done ) => {

		User.forge().fetch().then(( results ) => {

			expect( results ).to.equal( null );
			done();

		});

	});

	describe( 'create', () => {

		const test = require( './models/user/create' );
		it( 'should save a user to the database', test.create );


	});

	describe( 'update', () => {

		const test = require( './models/user/update' );
		it( 'should update a user in the database', test.update );
		it( 'should update a user\'s password in the database', test.updatePassword );
		it( 'logs the user out', test.logout );
		it( 'logs the user in', test.login );

	});

	describe( 'destroy', () => {

		const test = require( './models/user/delete' );
		it( 'should delete a user from the database', test.destroy );

	});

	after(( done ) => {

		return knex.migrate.rollback()
			.then(() => done());

	});

});