var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );
var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const logout = ( done ) => {

	User.where({ id : 1 }).fetch()

		.then(( user ) => {

			const token = jwt.sign( { user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

			api.get( '/users/logout' )

				.set( 'x-access-token', token )

				.expect( 200 )
				.expect( 'Content-Type', /json/ )
				.end(( err, res ) => {

					if ( err ) {
						return done( err );
					}

					res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
					res.body.should.have.property( 'message' ).and.be.a( 'string' );
					res.body.should.not.have.property( 'token' );
					res.body.should.not.have.property( 'user' );

					done();	

				});

		});

}

const noToken = ( done ) => {

	api.get( '/users/logout' )

		.set( 'x-access-token', null )

		.expect( 403 )
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

	logout  : logout,
	noToken : noToken

};