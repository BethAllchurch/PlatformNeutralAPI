'use strict';

var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const index = ( done ) => {

	User.where({ id : 1 }).fetch()

	.then(( user ) => {

		const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

		api.get( '/users' )
			.set( 'x-access-token', token )
			.expect( 200 )
			.expect( 'Content-Type', /json/ )
			.end(( err, res ) => {

				if ( err ) {
					return done( err );
				}		

				res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
				res.body.should.have.property( 'message' ).and.be.a( 'string' );
				res.body.should.have.property( 'users' ).and.be.instanceof( Array );

				done();

			});

	});

}

const noToken = ( done ) => {

	api.get( '/users' )
		.expect( 403 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}		

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.not.have.property( 'users' );

			done();

		});

}

module.exports = {

	index   : index,
	noToken : noToken

};