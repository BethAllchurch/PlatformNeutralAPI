var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

const missingParams = ( done ) => {

	api.post( '/users/register' )

		.send({ 

			username : 'test', 
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

			done();	

		});

}

const register = ( done ) => {

	api.post( '/users/register' )

		.send({ 

			username : 'test', 
			email : 'test@test.com',
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
			res.body.user.should.have.property( 'logged_in' ).and.to.equal( true );

			res.body.user.should.not.have.property( 'password' );

			done();	

		});
}

const userAlreadyExists = ( done ) => {

	api.post( '/users/register' )

		.send({ 

			username : 'test', 
			email : 'test@test.com',
			password : 'password' 

		})

		.expect( 409 )
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

	missingParams      : missingParams,
	register           : register,
	userAlreadyExists  : userAlreadyExists 

};