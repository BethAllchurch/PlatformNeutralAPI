var config = require( './config' );

module.exports = {

  test : {

    client     : 'mysql',
    connection : config.database.test
    
  },

  development : {

    client     : 'mysql',
    connection : config.database.development

  },

};