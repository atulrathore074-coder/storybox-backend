const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const path = require("path");

const localStoragePath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(localStoragePath)) {
  fs.mkdirSync(localStoragePath, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localStoragePath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const createS3Instance = (hostname, accessKeyId, secretAccessKey) => {
  if (!hostname || typeof hostname !== "string" || !hostname.startsWith("http")) {
    return null;
  }
  try {
    return new aws.S3({
      accessKeyId,
      secretAccessKey,
      endpoint: new aws.Endpoint(hostname),
      s3ForcePathStyle: true,
    });
  } catch (e) {
    return null;
  }
};

const getActiveStorage = async () => {
  const settings = global.settingJSON || {};
  if (settings.storage?.local) return "local";
  if (settings.storage?.awsS3) return "aws";
  if (settings.storage?.digitalOcean) return "digitalocean";
  return "local"; // Fallback to local storage if no storage is active
};

const getStorage = async () => {
  const activeStorage = await getActiveStorage();
  const settings = global.settingJSON || {};

  if (activeStorage === "digitalocean" && settings.doHostname?.startsWith("http")) {
    const s3 = createS3Instance(settings.doHostname, settings.doAccessKey, settings.doSecretKey);
    if (s3) {
      return multerS3({
        s3,
        bucket: settings.doBucketName,
        acl: "public-read",
        key: (req, file, cb) => {
          const folder = req.body.folderStructure || "uploads";
          cb(null, `${folder}/${file.originalname}`);
        },
      });
    }
  }

  if (activeStorage === "aws" && settings.awsHostname?.startsWith("http")) {
    const s3 = createS3Instance(settings.awsHostname, settings.awsAccessKey, settings.awsSecretKey);
    if (s3) {
      return multerS3({
        s3,
        bucket: settings.awsBucketName,
        key: (req, file, cb) => {
          const folder = req.body.folderStructure || "uploads";
          cb(null, `${folder}/${file.originalname}`);
        },
      });
    }
  }

  return localStorage;
};

const uploadMiddleware = async (req, res, next) => {
  try {
    const storage = await getStorage();
    multer({ storage }).single("content")(req, res, next);
  } catch (error) {
    next(error); // Pass error to the error handler if any issue occurs
  }
};

module.exports = uploadMiddleware;

