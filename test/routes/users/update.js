var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const update = ( done ) => {

	User.where({ id : 1 }).fetch()

		.then(( user ) => {

			const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

			api.put( '/users/update' )

				.set( 'x-access-token', token )
		
				.send({ 

					username : 'updatedtest'

				})

				.expect( 200 )
				.expect( 'Content-Type', /json/ )
				.end(( err, res ) => {

					if ( err ) {
						return done( err );
					}					

					res.body.should.have.property( 'success' ).and.be.a( 'boolean' ).and.to.equal( true );
					res.body.should.have.property( 'message' ).and.be.a( 'string' );
					res.body.should.have.property( 'user' ).and.be.instanceof( Object );
					res.body.user.should.have.property( 'updates' ).and.be.instanceof( Object );

					res.body.user.updates.should.have.property( 'username' ).and.be.instanceof( Object );
					res.body.user.updates.username.should.have.property( 'previous' ).and.to.equal( 'test' );
					res.body.user.updates.username.should.have.property( 'current' ).and.to.equal( 'updatedtest' );

					res.body.user.should.not.have.property( 'password' );

					done();	

				});

		});

}



const noParams = ( done ) => {

	User.where({ id : 1 }).fetch()

		.then(( user ) => {

			const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

			api.put( '/users/update' )

				.set( 'x-access-token', token )
				
				.send({})

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

		});

}

const noToken = ( done ) => {

	api.put( '/users/update' )
	
	.send({ 

		username : 'newusername'

	})

	.expect( 403 )
	.expect( 'Content-Type', /json/ )
	.end(( err, res ) => {

		if ( err ) {
			return done( err );
		}

		done();	

	});	

}

const userDoesNotExist = ( done ) => {

	User.where({ id : 1 }).fetch()

		.then(( user ) => {

			const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

			user.destroy()

				.then( ( model ) => {

					api.put( '/users/update' )

						.set( 'x-access-token', token )
						
						.send({ 

							username : 'newusername'

						})

						.expect( 404 )
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

			});

		});

}

module.exports = {

	update           : update,
	noParams         : noParams,
	noToken          : noToken,
	userDoesNotExist : userDoesNotExist

};