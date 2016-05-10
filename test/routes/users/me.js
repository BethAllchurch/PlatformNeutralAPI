'use strict';

var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const me = ( done ) => {

	User.where({ id : 1 }).fetch()

	.then(( user ) => {

		const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

		api.get( '/users/me' )
			.set( 'x-access-token', token )
			.expect( 200 )
			.expect( 'Content-Type', /json/ )
			.end(( err, res ) => {

				if ( err ) {
					return done( err );
				}		

				res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
				res.body.should.have.property( 'message' ).and.be.a( 'string' );
				res.body.should.have.property( 'user' ).and.be.instanceof( Object );

				res.body.user.should.have.property( 'id' ).and.to.equal( 1 );

				done();

			});

	});

}

const noToken = ( done ) => {

	api.get( '/users/me' )
		.expect( 403 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}		

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.not.have.property( 'user' );

			done();

		});

}

module.exports = {

	me      : me,
	noToken : noToken

};