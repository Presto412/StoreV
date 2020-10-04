const cities = [
    "bangalore.storage.com",
    "amsterdam.storage.com",
    "toronto.storage.com",
    "singapore.storage.com"
];

const hostnameToIP = {
    "toronto.storage.com": process.env.STORAGE_TORONTO_IP + ":3001",
    "singapore.storage.com": process.env.STORAGE_SINGAPORE_IP + ":3002",
    "amsterdam.storage.com": process.env.STORAGE_AMSTERDAM_IP + ":3003",
    "bangalore.storage.com": process.env.STORAGE_BANGALORE_IP + ":3004"
};

module.exports = { cities, hostnameToIP };
