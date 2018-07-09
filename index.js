const UtilsHelper = require('./utils-helper.js'),
	Logger = require('./console-logger.js'),
	fsext = require('./fsext.js'),
	azureHlr = require('./azure-helper.js'),
	stat = require('./stat-helper.js'),
	net = require('./net-helper');

/*
	Module loader.
 */
class Utils {

	constructor() {
		this.UtilsHelper = UtilsHelper;
		this.Logger = Logger;
		this.fsExt = fsext;
		this.AzureHelper = azureHlr;
		this.StatHelper = stat;
		this.NetHelper = net;
	}

}

module.exports = new Utils();