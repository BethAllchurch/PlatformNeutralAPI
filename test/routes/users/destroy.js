'use strict';

var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const destroy = ( done ) => {

	const user = new User({

		username : 'destroyableuser',
		email    :'hi@test.com',
		password : 'password'

	});

	user.save()

	.then(( user ) => {

		const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

		api.post( '/users/destroy' )
			.set( 'x-access-token', token )
			.send({ password : 'password' })
			.expect( 200 )
			.expect( 'Content-Type', /json/ )
			.end(( err, res ) => {

				if ( err ) {
					return done( err );
				}		

				res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
				res.body.should.have.property( 'message' ).and.be.a( 'string' );

				User.where({ id : user.get( 'id' ) }).fetch()

					.then(( user ) => {

						should.not.exist( user );
						done();

					});

			});

	});

}

const wrongPassword = ( done ) => {

	const user = new User({

		username : 'test',
		email    :'hello@test.com',
		password : 'pa55word'

	});

	user.save()

	.then(( user ) => {

		const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

		api.post( '/users/destroy' )
			.set( 'x-access-token', token )
			.send({ password : 'password' })
			.expect( 422 )
			.expect( 'Content-Type', /json/ )
			.end(( err, res ) => {

				if ( err ) {
					return done( err );
				}	

				res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( false );
				res.body.should.have.property( 'message' ).and.be.a( 'string' );
				res.body.should.not.have.property( 'user' );

				// verify in db
				User.where({ id : user.get( 'id' ) }).fetch()
					.then(( user ) => {

						user.should.be.instanceof( Object );
						done(); 

					});

			});

	});

}

const noToken = ( done ) => {

	api.post( '/users/destroy' )
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

	destroy       : destroy,
	noToken       : noToken,
	wrongPassword : wrongPassword

};