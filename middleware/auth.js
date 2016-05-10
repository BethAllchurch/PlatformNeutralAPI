var jwt = require('jsonwebtoken');
var config = require('config');

module.exports = function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers[ 'x-access-token' ];

	if ( token ) {

		// verifies secret and checks exp
		jwt.verify( token, config.secret, ( err, decoded ) => {      

			if ( err ) {

				return res.status( 403 ).json({ 

					success : false, 
					message : 'Failed to authenticate token.' 

				});    

			} else {

				// if everything is good, save to request for use in other routes
				req.decoded = decoded;    
				next();

			}

		});

	} else {

		// if there is no token, return an error
	    return res.status( 403 ).json({ 

	        success : false, 
	        message : 'No token provided.' 

	    });

	}

}