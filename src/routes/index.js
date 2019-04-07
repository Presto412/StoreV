var express = require("express");
var router = express.Router();
var multer = require("multer");
const request = require("request-promise").defaults({ encoding: null });
var upload = multer({ dest: "/tmp/uploads/" });
const fs = require("fs");
const path = require("path");
const sha1 = require("js-sha1");

const mapPath = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "maps-" + process.env.SELF_HOSTNAME.split(".example.com")[0] + ".json"
);
const cities = [
  "bangalore.storage.com",
  "amsterdam.storage.com",
  "toronto.storage.com",
  "singapore.storage.com"
];
const hostnameToIP = {
  "bangalore.storage.com": process.env.STORAGE_BANGALORE_IP,
  "toronot.storage.com": process.env.STORAGE_TORONTO_IP,
  "singapore.storage.com": process.env.STORAGE_SINGAPORE_IP,
  "amsterdam.storage.com": process.env.STORAGE_AMSTERDAM_IP
};
const generateRandomIP = () => {
  let randomByte = function() {
    return Math.round(Math.random() * 256);
  };

  let isPrivate = function(ip) {
    return /^10\.|^192\.168\.|^172\.16\.|^172\.17\.|^172\.18\.|^172\.19\.|^172\.20\.|^172\.21\.|^172\.22\.|^172\.23\.|^172\.24\.|^172\.25\.|^172\.26\.|^172\.27\.|^172\.28\.|^172\.29\.|^172\.30\.|^172\.31\./.test(
      ip
    );
  };
  let ip =
    randomByte() + "." + randomByte() + "." + randomByte() + "." + randomByte();
  if (isPrivate(ip)) return generateRandomIP();
  return ip;
};

const getServerByDistance = async inputCity => {
  let distances = await Promise.all(
    cities.map(city => {
      return request(
        "https://www.distance24.org/route.json?stops=" +
          inputCity +
          "|" +
          city.split(".storage.com")[0]
      );
    })
  );
  distances = distances.map((response, index) => {
    return { distance: response.distance, hostname: cities[index] };
  });
  return distances.sort((a, b) => a.distance <= b.distance);
};

const getCityFromIP = ip => {
  const url =
    "http://api.ipstack.com/" +
    ip +
    "?access_key=" +
    process.env.IPCITY_ACCESSKEY;
  return request(url).then(response => {
    return response.city;
  });
};

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Storage Virtualization",
    success: true,
    message: ""
  });
});

router.post("/upload", upload.single("uploadFile"), async (req, res, next) => {
  let detailsArray = [];
  // get all servers
  // static for now
  let hostnames = cities;
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
  const backupUrl = "/backup";
  const mapUrl = "/updateMaps";
  let fileStream = fs.createReadStream(req.file.path);
  const fileHash = req.body.fileHash;
  let map;
  let mapJson = {};
  if (fs.existsSync(mapPath)) {
    map = fs.readFileSync(mapPath);
    mapJson = JSON.parse(map);
  }
  if (mapJson[fileHash]) {
    return res.render("index", {
      message: "File already exists",
      success: false,
      title: "Storage Virtualization"
    });
  }

  let promises = [];
  for (const hostname of hostnamesToBackup) {
    let backupOptions = {
      method: "POST",
      url: "http://" + hostname + ":3000" + backupUrl,
      headers: {
        "content-type": "multipart/form-data"
      },
      formData: {
        backupFile: {
          value: fileStream,
          options: {
            filename: req.file.originalname,
            contentType: req.file.mimetype
          }
        }
      }
    };
    promises.push(request(backupOptions));
  }
  fs.unlinkSync(req.file.path);
  let results = await Promise.all(promises);

  results.forEach(result => {
    detailsArray.push(JSON.parse(result).details);
  });

  let backups = [];
  detailsArray.forEach(detail => {
    backups.push({
      hostname: detail.hostname,
      path: detail.path
    });
  });
  const { hostname, path, ...others } = detailsArray[0];
  mapJson[fileHash] = {
    details: { ...others },
    backups
  };
  fs.writeFileSync(mapPath, JSON.stringify(mapJson));

  let mapPromises = [];
  for (const hostName of hostnames) {
    var options = {
      method: "POST",
      url: "http://" + hostName + ":3000" + mapUrl,
      body: mapJson,
      json: true
    };
    mapPromises.push(request(options));
  }
  results = await Promise.all(promises);
  res.render("index", {
    title: "Storage Virtualization",
    success: true,
    message: "Successfully uploaded!"
  });
});

router.post("/backup", upload.single("backupFile"), (req, res, next) => {
  const details = {
    name: req.file.originalname,
    path: req.file.path,
    mimetype: req.file.mimetype,
    hostname: process.env.SELF_HOSTNAME,
    date: new Date().toUTCString(),
    size: req.file.size
  };
  res.json({ success: true, details });
});

router.post("/updateMaps", (req, res, next) => {
  fs.writeFileSync(
    path.join(
      __dirname,
      "..",
      "..",
      "data",
      "maps-" + process.env.SELF_HOSTNAME.split(".example.com")[0] + ".json"
    ),
    JSON.stringify(req.body)
  );
  return res.json({ success: true });
});

router.get("/fileList", (req, res, next) => {
  if (!fs.existsSync(mapPath)) {
    return res.render("list", { message: "No files exist.", map: [] });
  }
  let map = JSON.parse(fs.readFileSync(mapPath));

  map = Object.keys(map).map(elem => {
    const details = map[elem].details;
    return {
      name: details.name,
      size: details.size,
      hash: elem,
      date: details.date
    };
  });

  res.render("list.ejs", { map, message: "" });
});

router.get("/download", (req, res, next) => {
  const fileHash = req.query.hash;
  if (!fs.existsSync(mapPath)) {
    return res.json({ message: "no files exist" });
  }
  let map = JSON.parse(fs.readFileSync(mapPath));
  const fileDetails = map[fileHash].details;
  let fileBackups = map[fileHash].backups;
  let possiblePresentFile = fileBackups.filter(
    file => file.hostname === process.env.SELF_HOSTNAME
  );

  if (possiblePresentFile.length !== 0) {
    return res.download(possiblePresentFile[0].path, fileDetails.name);
  }
  return res.json({ message: "file no exist", success: false });
});

router.get("/getServerToDownloadFrom", async (req, res, next) => {
  const ip = generateRandomIP();
  const city = await getCityFromIP(ip);
  const servers = await getServerByDistance(city);
  if (!fs.existsSync(mapPath)) {
    return res.json({ success: false, message: "no files yet" });
  }
  let map = JSON.parse(fs.readFileSync(mapPath));
  if (!map[req.query.hash]) {
    return res.json({ message: "file doesn't exist", success: false });
  }
  for (let server of servers) {
    for (let host of map[req.query.hash].backups) {
      if (host.hostname === server.hostname) {
        return res.json({
          url:
            "http://" +
            hostnameToIP[server.hostname] +
            ":3000/download?" +
            req.query.hash
        });
      }
    }
  }
  return res.json({ success: false, message: "no servers hold the file" });
});

router.get("/downloadFromPath", (req, res, next) => {
  try {
    return res.sendFile(req.query.path);
  } catch (error) {
    console.log(error);
  }
});

router.post("/checkHash", (req, res, next) => {
  console.log(req.body.fileHash);

  if (!fs.existsSync(mapPath)) {
    return res.json({ success: false, message: "no files yet" });
  }
  let map = JSON.parse(fs.readFileSync(mapPath));
  console.log(map);

  console.log(
    "TCL: Object.keys(map).indexOf(req.body.fileHash);",
    Object.keys(map).indexOf(req.body.fileHash)
  );
  if (req.body.fileHash && Object.keys(map).indexOf(req.body.fileHash) !== -1) {
    return res.json({ success: true, message: "file doesn't exist" });
  }
  return res.json({ success: false });
});

module.exports = router;
