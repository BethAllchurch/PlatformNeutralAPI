module.exports = {

	database : {

		test : {

			host     : '',
			user     : '',
			password : '',
			database : ''

		},

		development : {

			host     : '',
			user     : '',
			password : '',
			database : ''

		},
		
	},

	secret : '',

	sendgrid : {

		apiKey : '',

		passwordReset : ( email, expires, url ) => {

			return {

				to      : email,
				from    : '',
				subject : 'Reset Password',
				text    : `Please click the link to reset your password. This link will expire at ${expires}. \n
						   ${url} \n
						   If you did not request this, please ignore this email.`

			};

		}

	}

}