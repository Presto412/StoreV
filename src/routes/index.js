var express = require("express");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "/tmp/uploads/" });
const fs = require("fs");
const path = require("path");
const ipConstants = require("../constants/ipConstants");
const apiHelper = require("../utils/apiHelpers");
const utilityHelper = require("../utils/utilityHelper");

const mapPath = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "maps-" + process.env.SELF_HOSTNAME.split(".example.com")[0] + ".json"
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Storage Virtualization",
    success: true,
    message: ""
  });
});

router.post("/upload", upload.single("uploadFile"), async (req, res, next) => {
  try {
    let detailsArray = [];
    // get all servers
    // static for now
    let hostnames = ipConstants.cities;
    let hostnamesToBackup = utilityHelper.getHostnamesToBackup(hostnames);
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

    let promises = apiHelper.backupToHosts(
      hostnamesToBackup,
      fileStream,
      req.file.originalname,
      req.file.mimetype
    );

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

    let mapPromises = apiHelper.updateMaps(hostnames, mapJson);
    results = await Promise.all(mapPromises);
    res.render("index", {
      title: "Storage Virtualization",
      success: true,
      message: "Successfully uploaded!"
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
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
    mapPath,
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
  const { city } = await utilityHelper.generateValidIP();
  console.log("TCL: city", city);
  const servers = await apiHelper.getServerByDistance(city, ipConstants.cities);
  console.log("TCL: servers", servers);
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
        console.log("TCL: server.hostname", server.hostname);
        return res.json({
          url: `http://${ipConstants.hostnameToIP[server.hostname]}/download?hash=${req.query.hash}`
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
