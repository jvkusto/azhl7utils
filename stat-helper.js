const	path = require('path'),
				fs = require('fs'),
	fsExt = require('./fsext.js'),
	NetHelper = require('./net-helper.js'),
	UtilsHelper = require('./utils-helper.js'),
	CSV_INFO_HEADER = [
		'code',
		'mode',
		'client',
		'historical',
		'mtype',
		'error',
		'fileName',
		'start',
		'end',
		'time',
		'rec_ip',
		'sender_ip',
		'msgid',
		'count',
		'ts'
	],
	NAME_SVC = path.join( process.env.NAME_SVC || 'svc' ),
	INFO_EXT = process.env.INFO_EXT || '.csv',
	infoDir = path.join(process.env.INFO_OUT_DIR || '/efs/info', NAME_SVC),
	infoLocalDir = path.join('./', process.env.INFO_LOCAL_DIR || 'info'),
	infoAppender = process.env.INFO_APPEND_TIME_SEC || 300,
	runInterval = infoAppender * 1.2,
	LOCAL_IP = NetHelper.getIP();

  let cancelCopyCachedFiles, prevCopyRunTime = new Date(),
		movedCachedFiles = async ()=>{
			if( !infoDir ) {
				return;
			}
			let files = fsExt.readdir( infoLocalDir, { ext: INFO_EXT } );
			for( let f in files) {
				let srcFile = files[f],
					delayFileTime = new Date(),
					fileTime = path.basename(srcFile, INFO_EXT).split('_')[0];

					delayFileTime.setSeconds(delayFileTime.getSeconds() - runInterval );
					let cur_fileTime = UtilsHelper.getFileNameTime(infoAppender, false, delayFileTime);

				if (cur_fileTime >= fileTime) {
					let destFile = srcFile.replace(infoLocalDir, infoDir);
					await fsExt.appendFileToFile(srcFile, destFile);
					fs.unlinkSync(srcFile);
				}
			}
		};

  fsExt.mkdirSync(infoDir);
	movedCachedFiles();

class StatHlper {

	static async saveInfoToFile(message){
		// Save info stat data to local file.
		if (message) {
			let text = CSV_INFO_HEADER.map( name => message[name] || '' ).join('|'),
				infoFilePath = path.join(infoLocalDir, `${UtilsHelper.getFileNameTime( infoAppender )}_cnv_(${message.rec_ip || LOCAL_IP })${INFO_EXT}`);
			fsExt.mkdirSync(infoLocalDir);
			await fsExt.appendFile(infoFilePath, text + '\n');
		}
		if( infoDir ) {
			// cancel prev timer for copy logs from local to shared folder.
			if (cancelCopyCachedFiles) {
				clearTimeout(cancelCopyCachedFiles);
			}
			//set next time to call movedCachedFiles.
			cancelCopyCachedFiles = setTimeout(movedCachedFiles, runInterval * 1000);

			// run movedCachedFiles if not runs long time.
			if( Date.now() - prevCopyRunTime >= runInterval * 1000 ){
				movedCachedFiles()
				prevCopyRunTime = Date.now();
			}
		}
	};
}
module.exports = StatHlper;
