var express = require("express");
var router = express.Router();
var multer = require("multer");
const request = require("request-promise");
var upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/upload", upload.single("uploadFile"), async (req, res, next) => {
  let detailsArray = [
    {
      name: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      hostname: process.env.SELF_HOSTNAME
    }
  ];
  // get all servers
  // static for now
  let hostnames = [
    "server1.example.com",
    "server2.example.com",
    "server3.example.com",
    "server4.example.com",
    "server5.example.com"
  ];
  const selfName = process.env.SELF_HOSTNAME;
  hostnames = hostnames.filter(n => n !== selfName);
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
          value: fs.createReadStream(req.file.path),
          options: {
            filename: req.file.originalname,
            contentType: req.file.mimetype
          }
        }
      }
    };
    promises.push(request(backupOptions));
  }
  let results = await Promise.all(promises);

  results.forEach(result => {
    detailsArray.push(JSON.parse(result).details);
  });

  const mapPath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "maps-" + process.env.SELF_HOSTNAME.split(".example.com")[0] + ".json"
  );
  let map;
  let mapJson = {};
  if (fs.existsSync(mapPath)) {
    map = fs.readFileSync(mapPath);
    mapJson = JSON.parse(map);
  }
  detailsArray.forEach(detail => {
    const { hostname, ...others } = detail;
    if (mapJson[detail.hostname]) {
      mapJson[detail.hostname].push(others);
    } else {
      mapJson[detail.hostname] = [others];
    }
  });

  fs.writeFileSync(mapPath, JSON.stringify(mapJson));

  let mapPromises = [];
  console.log(hostnames);
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
  res.json({ success: true });
});

router.post("/backup", upload.single("backupFile"), (req, res, next) => {
  const details = {
    name: req.file.originalname,
    path: req.file.path,
    mimetype: req.file.mimetype,
    hostname: process.env.SELF_HOSTNAME
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
module.exports = router;
