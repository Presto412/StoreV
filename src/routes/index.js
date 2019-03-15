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
  let hostnames = [
    "server1.example.com",
    "server2.example.com",
    "server3.example.com",
    "server4.example.com",
    "server5.example.com"
  ];
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
  let fileContent = fs.readFileSync(req.file.path);
  let fileStream = fs.createReadStream(req.file.path);
  const fileHash = sha1(fileContent);
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

router.get("/download", async (req, res, next) => {
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
  // take a random path
  let extPathIndex = Math.floor(Math.random() * fileBackups.length);
  console.log(extPathIndex);

  const fileHostDetails = fileBackups[extPathIndex];

  request.get(
    "http://" +
      fileHostDetails.hostname +
      ":3000/downloadFromPath?path=" +
      fileHostDetails.path,
    (err, response, body) => {
      if (err) {
        console.log("request error", error);
        return next(error);
      }
      console.log(
        "http://" +
          fileHostDetails.hostname +
          ":3000/downloadFromPath?path=" +
          fileHostDetails.path
      );

      const tempPath = path.join(
        __dirname,
        "..",
        "..",
        "data",
        fileDetails.name
      );
      console.log(response.url, response.headers);

      fs.writeFile(tempPath, body, err => {
        if (err) {
          console.log("error");
          throw err;
        }

        res.download(tempPath, fileDetails.name, () => {
          fs.unlinkSync(tempPath);
        });
      });
    }
  );
});

router.get("/downloadFromPath", (req, res, next) => {
  try {
    return res.sendFile(req.query.path);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
