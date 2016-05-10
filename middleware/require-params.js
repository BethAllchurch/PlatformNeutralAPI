'use strict';

module.exports = ( req, res, requiredParams ) => {

	let missingParams = [];

	requiredParams.forEach(( paramName ) => {

		missingParams = req.body[ paramName ] ? missingParams : missingParams.concat([ paramName ]);

	});

	if ( missingParams.length > 0 ) {

		const lastParam = missingParams.pop();
		const message = missingParams.length === 0 ? `${lastParam} is required.` : `${missingParams.join(', ')} and ${lastParam} are required`;

		res.statusCode = 422;

		return { 

			success : false, 
			message : message 

		};

	} 

	return { success : true };

}