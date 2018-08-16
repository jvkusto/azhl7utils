const path = require('path'),
	fs = require('fs'),
	fsExt = require('./fsext.js');

	function formatNumberLength(num, length) {
	let r = '' + num;
	while (r.length < length) {
		r = '0' + r;
	}
	return r;
};

class UtilsHelper {

	static formatNumberLength(num, length) {
		return formatNumberLength(num, length);
	};

	static getFileNameTime( fileIntervalSec, includeMSec, d ){
		let fileIntervalHour = fileIntervalSec >= 3600 ? Math.round(fileIntervalSec / 3600) : 0;
		let fileIntervalMin = fileIntervalSec >= 60 ? Math.round(fileIntervalSec / 60) : 0;
		fileIntervalSec = (fileIntervalSec >= 60 ? Math.round(fileIntervalSec % 60) : fileIntervalSec) || 0;
		d = d || new Date();
		return  (d.getFullYear()-2000)
			+ formatNumberLength((d.getMonth() + 1), 2)
			+ formatNumberLength(d.getDate(), 2)
			+ formatNumberLength(d.getHours() - (fileIntervalHour > 0 ? d.getHours() % fileIntervalHour : 0), 2)
			+ formatNumberLength(d.getMinutes() - (fileIntervalMin > 0 ? d.getMinutes() % fileIntervalMin : 0), 2)
			+ formatNumberLength(fileIntervalSec > 0 ? d.getSeconds() - d.getSeconds() % fileIntervalSec : 0, 2)
			+ (includeMSec ? formatNumberLength(d.getMilliseconds(), 3) : '');
	}
	
	static getTimeToString( includeMSec ){
		let d = new Date();
		return (d.getFullYear())
			+ formatNumberLength((d.getMonth() + 1), 2)
			+ formatNumberLength(d.getDate(), 2)
			+ formatNumberLength(d.getHours(), 2)
			+ formatNumberLength(d.getMinutes(), 2)
			+ formatNumberLength(d.getSeconds(), 2)
			+ (includeMSec ? formatNumberLength(d.getMilliseconds(), 3) : '');
	}
	
	static readdir(folderPath, opts ) {
		return fsExt.readdir(folderPath, opts );
	}

	static sortDescFiles(array, opts) {
		opts = opts || {};
		let field = opts.sort_fields || false,
			splitter = opts.splitter || '_';

		return array.sort(function(a, b) {
			a = a && field && a[field] || a;
			b = b && field && b[field] || b;
			let x = path.basename(a, opts.ext).split(splitter)[0];
			let y = path.basename(b, opts.ext).split(splitter)[0];

			if (typeof x == 'string'){
				x = (''+x).toLowerCase();
			}
			if (typeof y == 'string'){
				y = (''+y).toLowerCase();
			}
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	}

	static returnResponse(httpResponse, status, message, logger){

		if( (typeof message).toLowerCase() == 'object' ) {
			message = JSON.stringify(message);
		}

		if (status === 200) {
			//console.info(message);
		} else {
			console.error(message);
		}

		httpResponse.writeHead(status);
		httpResponse.write(message);
		httpResponse.end();
	}

	static isStop( settingsFilePath, service_name) {
		let stop = false;
		if (fs.existsSync(settingsFilePath)) {
			try {
				let settings = JSON.parse(fs.readFileSync(settingsFilePath));
				stop = settings && settings[service_name] && settings[service_name].status == 'stop';
			} catch (err) {
				console.error(err)
			}
		}
		return stop;
	}
}

module.exports = UtilsHelper;

String.prototype.replaceAll = function(search, replacement) {
	let target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};
