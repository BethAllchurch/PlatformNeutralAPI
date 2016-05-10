
exports.up = function( knex, Promise ) {

	return knex.schema.createTable( 'users', ( table ) => {

		table.increments();
		table.string( 'username' );
		table.string( 'email' ).unique();
		table.string( 'password' );
		table.boolean( 'logged_in' );
		table.string( 'reset_password_token' );
		table.dateTime( 'reset_password_expires' );
		table.timestamps();

	});

};

exports.down = function( knex, Promise ) {
  
	return knex.schema.dropTable( 'users' );

};
