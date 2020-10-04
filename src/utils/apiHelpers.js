const request = require("request-promise").defaults({ encoding: null });
const apiConstants = require("../constants/apiConstants");

const getCityFromIP = ip => {
    const url = `${apiConstants.baseURIs.apiStack}${ip}?access_key=${process.env.IPCITY_ACCESSKEY}`;
    console.log("TCL: url", url);

    return request(url).then(response => {
        response = JSON.parse(response);
        return response.city;
    });
};

const getServerByDistance = async (inputCity, cities) => {
    let distances = await Promise.all(
        cities.map(city => {
            return request(
                `${apiConstants.baseURIs.distance24}route.json?stops=${inputCity}|${city.split(".storage.com")[0]}`
            );
        })
    );
    distances = distances.map((response, index) => {
        return { distance: JSON.parse(response).distance, hostname: cities[index] };
    });
    return distances.sort((a, b) => a.distance >= b.distance);
};

const backupToHosts = (hostnamesToBackup, fileStream, filename, contentType) => {
    const promises = [];
    for (const hostname of hostnamesToBackup) {
        const options = {
            method: "POST",
            url: `http://${hostname}:3000/backup`,
            headers: {
                "content-type": "multipart/form-data"
            },
            formData: {
                backupFile: {
                    value: fileStream,
                    options: {
                        filename,
                        contentType
                    }
                }
            }
        };
        promises.push(options);
    }
    return promises;
};

const updateMaps = (hostnames, mapJson) => {
    const promises = [];
    for (const hostname of hostnames) {
        const options = {
            method: "POST",
            url: `http://${hostname}:3000/updateMaps`,
            body: mapJson,
            json: true
        };
        promises.push(request(options));
    }
    return promises;
};

module.exports = { getCityFromIP, getServerByDistance, backupToHosts, updateMaps };
