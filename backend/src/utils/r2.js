import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the S3 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const configMap = {
  avatar: { folder: "user/avatars" },
  coverImage: { folder: "user/coverImages" },
  video: { folder: "videos/raw" },
  thumbnail: { folder: "videos/thumbnails" },
};

// This controller function replaces your multer middleware route
export const generateUploadUrl = async (req, res) => {
  try {
    // Frontend sends the file name, type, and what it's for (e.g., 'video' or 'avatar')
    const { fileName, fileType, uploadType } = req.body;

    const folder = configMap[uploadType]?.folder || "misc";
    const extension = fileName.split(".").pop();
    const key = `${folder}/${Date.now()}-${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType, // Must match exactly what the frontend sends
    });

    // Generate a URL that expires in 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 900,
      signableHeaders: new Set(["content-type"]),
    });

    res.status(200).json({
      uploadUrl: signedUrl,
      publicId: key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};
