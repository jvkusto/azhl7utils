const UtilsHelper = require('./utils-helper.js'),
	Logger = require('./console-logger.js'),
	fsext = require('./fsext.js'),
	azureHlr = require('./azure-helper.js');

/*
	Module loader.
 */
class Utils {

	constructor() {
		this.UtilsHelper = UtilsHelper;
		this.Logger = Logger;
		this.fsExt = fsext;
		this.AzureHelper = azureHlr;
	}

}

module.exports = new Utils();