var should = require( 'chai' ).should();
var expect = require( 'chai' ).expect;
var supertest = require( 'supertest' );
var api = supertest( 'http://localhost:3000' );

var jwt = require( 'jsonwebtoken' );
var config = require( 'config' );
var User = require( 'models/User' );

const secureUpdate = ( done ) => {

	var user = new User({

		username : 'test',
		email    : 'test@test.com',
		password : 'pa55word'

	});

	user.save()

		.then(( user ) => {

			const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );			

			api.put( `/users/secure-update` )

				.set( 'x-access-token', token )
		
				.send({ 

					password       : 'pa55word',
					email          : 'test@example.com',
					'new-password' : 'password'

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

					res.body.user.updates.should.have.property( 'email' ).and.be.instanceof( Object );
					res.body.user.updates.email.should.have.property( 'previous' ).and.to.equal( 'test@test.com' );
					res.body.user.updates.email.should.have.property( 'current' ).and.to.equal( 'test@example.com' );

					res.body.user.should.not.have.property( 'password' );
					res.body.user.updates.should.not.have.property( 'password' );

					done();	

				});

		});

}

const wrongPassword = ( done ) => {

	User.where({ username : 'test' }).fetch()

	.then(( user ) => {

		const token = jwt.sign({ user : user.publicAttributes }, config.secret, { expiresIn : 1440 } );

		api.put( `/users/secure-update` )
			
			.set( 'x-access-token', token )

			.send({ 

				password : 'wrongpassword',
				email    : 'another@email.com'

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

	});

}

module.exports = {

	secureUpdate  : secureUpdate,
	wrongPassword : wrongPassword

};
