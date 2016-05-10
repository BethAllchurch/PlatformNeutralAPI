var expect = require( 'chai' ).expect;
var User = require( 'models/User' );

const destroy = ( done ) => {

	User.where({ email : 'theone@thematrix.org' }).destroy()
		.then(( model ) => {

			User.where({ email : 'theone@thematrix.org' }).fetch().then(( user ) => {

				expect( user ).to.equal( null );
				done();

			});

		});

};

module.exports = { destroy : destroy };