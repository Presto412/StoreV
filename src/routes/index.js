var express = require("express");
var router = express.Router();
var multer = require("multer");
const request = require("request-promise");
var upload = multer({ dest: "uploads/" });
const fs = require("fs");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/upload", upload.single("uploadFile"), (req, res, next) => {
  console.log("filename", req.file.filename);
  // get all servers
  // static for now
  let hostnames = ["server2.example.com"];
  const selfName = process.env.SELF_HOSTNAME;
  hostnames = hostnames.filter(n => n !== selfName);
  const url = "/backup";
  var options = {
    method: "POST",
    url: "http://" + hostnames[0] + ":3000" + url,
    headers: {
      "content-type": "multipart/form-data"
    },
    formData: {
      backupFile: {
        value: fs.createReadStream(req.file.path),
        options: {
          filename: "newuser.csv",
          contentType: "text/csv"
        }
      }
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    res.json({ filename: req.file.filename });
  });
  // const response = await request.post(hostnames[0] + url, )
  // randomly pick two

  // store in them

  // update map in all
});

router.post("/backup", upload.single("backupFile"), (req, res, next) => {
  console.log(req.file.filename);

  res.json({ success: true });
});
module.exports = router;
