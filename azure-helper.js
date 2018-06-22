const path = require('path'),
	fs = require('fs'),
	CLOUD_ERROR = 'xml-error';

let blobs = {};

class AzureHelper {

	constructor(azureStorage){
		this.azure = azureStorage;
	}

	async getBlobSvc( client_name, connStr, postCall ) {
		if(!blobs[client_name]){

			if( !connStr ){
				throw new Error('Blob conn string is undefined.');
			}
			let bSrv = this.azure.createBlobService(connStr);

			if(bSrv && postCall){
				postCall(bSrv);
			}

			blobs[client_name] = bSrv;
		}
		return blobs[client_name];
	}

	createContainerIfNotExists(blob_service, containerName ) {
		return new Promise((resolve, reject) => {
			blob_service.createContainerIfNotExists(containerName, {	publicAccessLevel: 'blob'	}, (err, result, response)=>{
				if (err) {
					console.log('Failed to create blob:', containerName, err);
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	async writeFile(blob_service, sourceFilePath, blobName, containerName ){
		containerName = containerName || CLOUD_ERROR;
		try {
			await this.appendFile(blob_service, sourceFilePath, blobName, containerName);
		}catch(err){
			await this.createFile(blob_service, sourceFilePath, blobName, containerName);
//			await this.appendFile(blob_service, sourceFilePath, blobName, containerName);
		}
	};

	createFile(blob_service, sourceFilePath, blobName, containerName ){
		containerName = containerName || CLOUD_ERROR;
		return new Promise((resolve, reject) => {
			blob_service.createAppendBlobFromLocalFile(containerName, blobName, sourceFilePath, err => {
				if(err) {
					reject(err);
				} else {
					resolve({ message: `Created append of '${blobName}' complete` });
				}
			});
		});
	};

	appendFile(blob_service, sourceFilePath, blobName, containerName ){
		containerName = containerName || CLOUD_ERROR;
		return new Promise((resolve, reject) => {
			blob_service.appendFromLocalFile(containerName, blobName, sourceFilePath, err => {
				if(err) {
					reject(err);
				} else {
					resolve({ message: `Append of '${blobName}' complete` });
				}
			});
		});
	};

	removeFile( blob_service, sourceFilePath, containerName ){
		containerName = containerName || CLOUD_ERROR;
		let blobName = path.basename(sourceFilePath);
		return new Promise((resolve, reject) => {
			blob_service.deleteBlobIfExists(containerName, blobName, err => {
				if(err) {
					reject(err);
				} else {
					resolve({ message: `Block blob '${blobName}' deleted` });
				}
			});
		});
	};

	createQueueIfNotExists(sbService, queueName) {
		return new Promise((resolve, reject) => {
			sbService.createQueueIfNotExists(queueName, function (err) {
				if (err) {
					console.log('Failed to create queue: ', err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	createMessage(sbService, queueName, txt) {
		return new Promise((resolve, reject) => {
			sbService.createMessage(queueName, txt, (err, data) =>{
				if (err) {
					console.error('Send', err);
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}


	checkForMessages(sbService, queueName) {
		return new Promise((resolve, reject) => {
			sbService.getMessages(queueName, function (err, serverMessages) {
				if (err) {
					if (err == 'No messages to receive') {
						console.log('No messages');
						resolve('');
					} else {
						//callback(err);
						console.error('Error getMessages', err);
						reject(err);
					}
				} else {

					if( serverMessages.length == 0 || !serverMessages[0].messageText ){
						/* No more messages */
						resolve('');
						return;
					}

					let text = serverMessages[0].messageText;
					sbService.deleteMessage(queueName, serverMessages[0].messageId, serverMessages[0].popReceipt, function(err2) {
						if (err2) {
							console.error('Can not delete the message', text, err2);
							resolve(text);
						}else{
							// Message deleted
							resolve(text);
						}
					});
				}
			});
		});
	}

}

module.exports = AzureHelper;