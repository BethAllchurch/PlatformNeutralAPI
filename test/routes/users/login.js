'use strict';

var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

const missingParams = ( done ) => {

	api.post( '/users/login' )

		.send({ 

			email : 'test@test.com'

		})

		.expect( 422 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.not.have.property( 'user' );
			res.body.should.not.have.property( 'token' );

			done();	

		});

}

const login = ( done ) => {

	api.post( '/users/login' )

		.send({ 

			email    : 'test@test.com',
			password : 'password'

		})
		.expect( 200 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.have.property( 'token' ).and.be.a( 'string' );
			res.body.should.have.property( 'user' ).and.be.instanceof( Object );

			res.body.user.should.have.property( 'id' );
			res.body.user.should.have.property( 'username' );
			res.body.user.should.have.property( 'email' );

			res.body.user.should.not.have.property( 'password' );

			done();	

		});
}

const userDoesNotExist = ( done ) => {

	api.post( '/users/login' )

		.send({ 

			email    : 'mavisbeacon@mavisbeaconteachestyping.com',
			password : 'password'

		})
		.expect( 404 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.not.have.property( 'token' );
			res.body.should.not.have.property( 'user' );

			done();	

		});

}

const wrongPassword = ( done ) => {

	api.post( '/users/login' )

		.send({ 

			email    : 'test@test.com',
			password : 'pa55word'

		})
		.expect( 422 )
		.expect( 'Content-Type', /json/ )
		.end(( err, res ) => {

			if ( err ) {
				return done( err );
			}

			res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
			res.body.should.have.property( 'message' ).and.be.a( 'string' );
			res.body.should.not.have.property( 'token' );
			res.body.should.not.have.property( 'user' );

			done();	

		});

}

module.exports = {

	missingParams    : missingParams,
	login            : login,
	userDoesNotExist : userDoesNotExist,
	wrongPassword    : wrongPassword,

};
