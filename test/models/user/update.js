var expect = require( 'chai' ).expect;
var User = require( 'models/User' );

const update = ( done ) => {

	User.where({ email : 'neo@thematrix.org' }).fetch()
		.then(( user ) => {

			user.set({ 

				username : 'theone',
				email    : 'theone@thematrix.org'

			});

			return user.save();

		})
		.then(() => User.where({ email : 'theone@thematrix.org' }).fetch())
		.then(( user ) => {

			expect( user.get( 'username' ) ).to.equal( 'theone' );

			return user.verifyPassword( 'morpheus' );

		})
		.then(( res ) => {

			expect( res ).to.equal( true );
			done();

		});

};

const updatePassword = ( done ) => {

	User.where({ email : 'theone@thematrix.org' }).fetch()
		.then(( user ) => {

			return user.set({ password : 'trinity' }).save();

		})
		.then(() => User.where({ email : 'theone@thematrix.org' }).fetch())
		.then(( user ) => user.verifyPassword( 'trinity' ))
		.then(( res ) => {

			expect( res ).to.equal( true );
			done();

		});

};

const logout = ( done ) => {

		User.where({ email : 'theone@thematrix.org' }).fetch()
		.then(( user ) => {

			return user.logout();

		})
		.then(() => User.where({ email : 'theone@thematrix.org' }).fetch())
		.then(( user ) => {

			expect( user.get( 'logged_in' ) ).to.equal( false );
			done();

		});

}

const login = ( done ) => {

		User.where({ email : 'theone@thematrix.org' }).fetch()
		.then(( user ) => {

			return user.login();

		})
		.then(() => User.where({ email : 'theone@thematrix.org' }).fetch())
		.then(( user ) => {

			expect( user.get( 'logged_in' ) ).to.equal( true );
			done();

		});

}

module.exports = {

	update         : update,
	updatePassword : updatePassword,
	logout         : logout,
	login          : login

};