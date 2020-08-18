module.exports = {
	logger: {
		level: 'debug', // level: method level, default is 'log':0, 'trace':1, 'debug':2, 'info':3, 'warn':4, 'error':5, 'fatal':6
	},
	jwtSecret: 'cdfd451bb1f9770479b8626d',
    encryptSecret: 'f08a439aab99bfdb64df27d8',
	addressSecret: '49c386c043fea881412f',
    hotWalletSecret: 'ghjyuyertvc4434fgbdf',
	backend_jwtSecret: 'dc284095a36f8168604287cc',
	game: require('./game_config'),
	gas_price_url: 'https://ethgasstation.info/json/ethgasAPI.json',
};
