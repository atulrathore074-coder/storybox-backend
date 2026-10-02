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
    const uniqueName = `${file.originalname}`;
    cb(null, uniqueName);
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
  } catch (err) {
    return null;
  }
};

const getActiveStorage = async () => {
  const settings = global.settingJSON || {};
  if (settings.storage?.local) return "local";
  if (settings.storage?.awsS3) return "aws";
  if (settings.storage?.digitalOcean) return "digitalocean";
  return "local"; // Default to local storage if no active storage is found
};

const getStorageType = async () => {
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
          const keyName = `${folder}/${file.originalname}`;
          cb(null, keyName);
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
          const keyName = `${folder}/${file.originalname}`;
          cb(null, keyName);
        },
      });
    }
  }

  return localStorage;
};

const uploadMultipleMiddleware = async (req, res, next) => {
  try {
    const storage = await getStorageType();
    const upload = multer({
      storage: storage,
    }).array("content", 10);

    upload(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = uploadMultipleMiddleware;

