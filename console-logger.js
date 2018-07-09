const	path = require('path'),
	fs = require('fs'),
	fsext = require('./fsext.js'),
	util = require('util'),
	NetHelper = require('./net-helper.js'),
	NAME_SVC = path.join( process.env.NAME_SVC || 'svc' ),
	localLogsDirectory = path.join( process.env.LOCAL_LOG_DIR || 'logs' ),
	sharedLogsDirectory = process.env.LOG_DIR ? path.join( process.env.LOG_DIR, NAME_SVC ) : '',
	LOG_INTERVAL_FLUSH_SEC = parseInt( process.env.LOG_INTERVAL_FLUSH_SEC || 300 ) * 1000,
	IP = NetHelper.getIP();
movedCachedLogs = async ()=>{
	if( !sharedLogsDirectory ) {
		return;
	}
	let logsFiles = fsext.readdir( localLogsDirectory, { ext: '.txt' } );
	for( let f in logsFiles) {
		let srcFile = logsFiles[f],
			destFile = srcFile.replace(localLogsDirectory, sharedLogsDirectory);
		await fsext.appendFileToFile(srcFile, destFile);
		fs.unlinkSync(srcFile);
	}
}

let cancelCopyCachedLogs,
	logStdout = process.stdout;


console.log('localLogsDirectory', localLogsDirectory);
console.log('sharedLogsDirectory', sharedLogsDirectory);

fsext.mkdirSync(localLogsDirectory);
fsext.mkdirSync(sharedLogsDirectory);

function noWriteLog(){
	writeToLog(arguments, false);
};

function writeLog(){
	writeToLog(arguments, process.env.CONSOLE_OUT);
};

function writeToLog( arguments, onConsole ){
	let d = new Date(),
		logFileName = path.join(localLogsDirectory, `${NAME_SVC}_${d.toLocaleDateString()}_(${IP}).txt`);
	n = d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + '.' + ('0000' + d.getMilliseconds()).slice(-4) + ' ';

	fs.appendFileSync(logFileName, n + util.format.apply(null, arguments) + '\n');
	onConsole && logStdout.write(n + util.format.apply(null, arguments) + '\n');

	if( sharedLogsDirectory ) {
		// cancel prev timer for copy logs from local to shared folder.
		if (cancelCopyCachedLogs) {
			clearTimeout(cancelCopyCachedLogs);
		}
		cancelCopyCachedLogs = setTimeout(movedCachedLogs, LOG_INTERVAL_FLUSH_SEC);
	}
};

console.error = writeLog;
console.log = writeLog;
console.info = writeLog;
/**
 * @deprecated since version 1.0.6 for NetHelper.getIP()
 */
console.getIP = function(){ return IP; }

movedCachedLogs()

class Logger {}
module.exports = Logger;