var config = require('./config');

// connect to database
var knex = require( 'knex' )({

	client     : 'mysql',
	connection : config.database[ process.env.NODE_ENV ],
	pool       : { min : 0, max : 7 }

});

// configure bookshelf ORM
var bookshelf = require( 'bookshelf' )( knex );

module.exports = {

	knex      : knex,
	bookshelf : bookshelf

};