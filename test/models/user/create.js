var expect = require( 'chai' ).expect;
var User = require( 'models/User' );

const create = ( done ) => {

	const user = new User({

		username : 'neo',
		email    : 'neo@thematrix.org',
		password : 'morpheus'

	}).save()
		.then(() => User.where({ email : 'neo@thematrix.org' }).fetch())
		.then(( user ) => {

			expect( user.get( 'username' ) ).to.equal( 'neo' );

			return user.verifyPassword( 'morpheus' );

		})
		.then(( res ) => {

			expect( res ).to.equal( true );
			done();

		});

};

module.exports = { create : create };