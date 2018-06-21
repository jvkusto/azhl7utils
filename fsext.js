const path = require('path'),
	fs = require('fs');

class FsExt {

	/*
		Do copy and return promise or error.nessage:
		src - path for sorce file;
		dest - destination path with file name.
	 */
	static copyFile( src, dest){
		return new Promise((resolve, reject) => {

			let message = '';
			if (!fs.existsSync(src)) {
				message = 'Src file not exists: ' + src;
				console.error(message);
			}
			if (fs.existsSync(dest)) {
				message = 'Dest file already exists: ' + dest;
				console.error(message);
			}

			try {
				if (!message) {
					let rs = fs.createReadStream(src),
						ws = fs.createWriteStream(dest);
					rs.pipe(ws);
					rs.on('end', function () {
						//console.log('RS done.', Date.now());
					});
					ws.on('finish', function () {
						//console.log('WS done.', Date.now());
						resolve();
					});
				}
			} catch (err) {
				message = err.message;
			} finally {
				if (message) {
					reject({message: message});
				}
			}
		});
	}

	static mkdirSync(targetDir, {isRelativeToScript = false} = {}) {
		targetDir = targetDir.trim();

		if(!targetDir || fs.existsSync(targetDir)){
			return;
		}
		const sep = path.sep;
		const initDir = path.isAbsolute(targetDir) ? sep : '';
		const baseDir = isRelativeToScript ? __dirname : '.';

		targetDir.split(sep).reduce((parentDir, childDir) => {
			let curDir = path.resolve(baseDir, parentDir, childDir).trim();
			try {
				if (!fs.existsSync(curDir)) {
					console.log(`Directory creating ${curDir}`);
					fs.mkdirSync(curDir);
				}
			} catch (err) {
				console.error('Error', curDir, err);
				if (err.code !== 'EEXIST') {
					throw err;
				}

				//console.debug(`Directory ${curDir} already exists!`);
			}

			return curDir;
		}, initDir);
	}

	static appendFile( file, text ) {
		return new Promise((resolve, reject) => {
			let message;
			try {

				let writeStream = fs.createWriteStream(file, {flags: 'a'});
				writeStream.end(text);
				writeStream.on('finish', () => {
					resolve();
				});

			} catch (err) {
				message = err.message;
			} finally {
				if (message) {
					reject({message: message});
				}
			}
		});
	}


	static appendFileToFile( src, dest ) {
		return new Promise((resolve, reject) => {
			let message;
			try {

				let readStream = fs.createReadStream(src);
				let writeStream = fs.createWriteStream(dest, {flags: 'a'});
				readStream.pipe(writeStream);
				writeStream.on('finish', () => {
					resolve();
				});

			} catch (err) {
				message = err.message;
			} finally {
				if (message) {
					reject({message: message});
				}
			}
		});
	}
}

module.exports = FsExt;