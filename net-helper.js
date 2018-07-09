const	os = require('os'),
		ifaces = os.networkInterfaces();

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

class NetHelper{
	static getIP(){
		return ips.length >0 && ips[0].address || '';
	}
}
module.exports = NetHelper;