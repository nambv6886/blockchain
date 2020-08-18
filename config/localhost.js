module.exports = {
	port: 8976,
	logger: {
		level: 'log', // level: method level, default is 'log':0, 'trace':1, 'debug':2, 'info':3, 'warn':4, 'error':5, 'fatal':6
	},
	"mysql": {
		"connectionLimit": 10,
		"host": "dev-uberoption.crbxbmcapwed.ap-southeast-1.rds.amazonaws.com",
		"user": "root",
		"password": "e67e5c7941897971524794383ab9f3a4",
		"database": "blockchain_service_dev",
		"multipleStatements": "true",
		"timezone": "+00:00",
		"debug": false
	},
};
