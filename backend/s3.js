require("dotenv").config();
const crypto = require("crypto");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET = process.env.S3_BUCKET;
// Credentials are picked up automatically from the EC2 IAM role
const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-south-1" });

async function uploadFile(file) {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return key;
}

// The bucket stays private; this gives a temporary link (1 hour)
function getFileUrl(key) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: 3600,
  });
}

async function deleteFile(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.error("Could not delete S3 object:", key, e.message);
  }
}

module.exports = { uploadFile, getFileUrl, deleteFile };
