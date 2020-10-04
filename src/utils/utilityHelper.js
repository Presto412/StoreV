const apiHelper = require('../utils/apiHelpers');

const generateValidIP = async () => {
    let ip = generateRandomIP();
    console.log("TCL: ip", ip);
    let city = await apiHelper.getCityFromIP(ip);
    if (city == null) {
        return generateValidIP();
    }
    console.log("city", city);

    return { city };
};

const generateRandomIP = () => {
    let randomByte = function () {
        return Math.round(Math.random() * 256);
    };

    let isPrivate = function (ip) {
        return /^10\.|^192\.168\.|^172\.16\.|^172\.17\.|^172\.18\.|^172\.19\.|^172\.20\.|^172\.21\.|^172\.22\.|^172\.23\.|^172\.24\.|^172\.25\.|^172\.26\.|^172\.27\.|^172\.28\.|^172\.29\.|^172\.30\.|^172\.31\./.test(
            ip
        );
    };
    let ip =
        randomByte() + "." + randomByte() + "." + randomByte() + "." + randomByte();
    if (isPrivate(ip)) return generateRandomIP();
    return ip;
};

const getHostnamesToBackup = (hostnames) => {
    let hostnamesToBackup = [];
    hostnamesToBackup[0] =
        hostnames[Math.floor(Math.random() * hostnames.length)];
    while (true) {
        if (hostnames.length < 2) {
            break;
        }
        let elem = hostnames[Math.floor(Math.random() * hostnames.length)];
        if (elem !== hostnamesToBackup[0]) {
            hostnamesToBackup[1] = elem;
            break;
        }
    }
    return hostnamesToBackup;
};

module.exports = { generateRandomIP, generateValidIP, getHostnamesToBackup };
