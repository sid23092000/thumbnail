const express = require("express");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const imageThumbnail = require("image-thumbnail");
const saveBuffer = require("save-buffer");
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: async (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single("myImage");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only");
  }
}

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static("./public"));

app.get("/", (rew, res) => res.render("index"));

app.post("/upload", (req, res) => {
  upload(req, res, async err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected"
        });
      } else {
        res.render("index", {
          msg: "File uploaded",
          file: `uploads/${req.file.filename}`
        });
        try {
          let options = {
            width: 200,
            height: 200,
            responseType: "base64",
            jpegOptions: { force: true, quality: 100 }
          };

          const thumbnail = await imageThumbnail(
            `public/uploads/${req.file.filename}`
          );
          thumbnailFilename = 'thumbnail_'+req.file.filename.split(".")[0]
          console.log(thumbnailFilename)
          console.log(thumbnail);
          const saveThumbnail = await saveBuffer(
            thumbnail,
            `public/thumbnail/${thumbnailFilename}.jpeg`
          );
        } catch (err) {
          console.error(err);
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server Started on port ${port}`);
});
