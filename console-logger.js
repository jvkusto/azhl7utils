const	path = require('path'),
	fs = require('fs'),
	fsext = require('./fsext.js'),
	os = require('os'),
	ifaces = os.networkInterfaces(),
	util = require('util'),
	NAME_SVC = path.join( process.env.NAME_SVC || 'svc' ),
	localLogsDirectory = path.join( process.env.LOCAL_LOG_DIR || 'logs' ),
	sharedLogsDirectory = path.join( process.env.LOG_DIR || '/efs/logs', NAME_SVC ),
	LOG_INTERVAL_FLUSH_SEC = parseInt( process.env.LOG_INTERVAL_FLUSH_SEC || 300 ) * 1000;


let ips = [];
Object.keys(ifaces).forEach(function (ifname) {
	let alias = 0;

	ifaces[ifname].forEach(function (iface) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
			return;
		}

		if (alias >= 1) {
			// this single interface has multiple ipv4 addresses
			console.log(ifname + ':' + alias, iface.address);
		} else {
			// this interface has only one ipv4 adress
			ips.push( {name: ifname, address: iface.address} );
			//console.log(ifname, iface.address);
		}
		++alias;
	});
});
let ip = ips.length>0 && ips[0].address || '' ;

console.log('loaclLogsDirectory', localLogsDirectory);
console.log('sharedLogsDirectory', sharedLogsDirectory);

fsext.mkdirSync(localLogsDirectory);
fsext.mkdirSync(sharedLogsDirectory);

// Simple console logger
// Or 'w' to truncate the file every time the process starts.
let	logStdout = process.stdout;

function noWriteLog(){
	writeToLog(arguments, false)
};

function writeLog(){
	writeToLog(arguments, process.env.CONSOLE_OUT)
};

function writeToLog( arguments, onConsole ){

	let d = new Date(),
		logFileName = path.join(localLogsDirectory, `${NAME_SVC}_${d.toLocaleDateString()}_(${ip}).txt`);
	n = d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + '.' + ('0000'+d.getMilliseconds()).slice(-4) + ' ';

	fs.appendFileSync( logFileName, n + util.format.apply(null, arguments) + '\n');
	onConsole && logStdout.write(n + util.format.apply(null, arguments) + '\n');
};


console.error = writeLog;
console.log = writeLog;
console.info = writeLog;

console.getIP = function(){ return ip; }

async function movedCachedLogs(){
	let logsFiles = fsext.readdir( localLogsDirectory, { ext: '.txt' } );
	for( let f in logsFiles) {
		let srcFile = logsFiles[f],
			destFile = srcFile.replace(localLogsDirectory, sharedLogsDirectory);
		await fsext.appendFileToFile(srcFile, destFile);
		fs.unlinkSync(srcFile);
	}
}

movedCachedLogs()
setInterval(movedCachedLogs, LOG_INTERVAL_FLUSH_SEC);

class Logger {}
module.exports = Logger;
