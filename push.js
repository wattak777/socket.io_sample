var request = require('request') ;
var options = {
	uri: "http://localhost:55555/do_push",
	headers: {
		"Content-type": "application/json"
	},
	json:{
		"count": null,
		"message": null
	}
} ;
options.json.count = process.argv[2] ;
options.json.message = process.argv[3] ;
request.post(options, (error, res, body) => {
}) ;

