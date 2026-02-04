import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/config';
import { Readable } from 'stream';
import axios from 'axios';

const s3 = new S3Client({
  region: config.AWS_REGION,
  endpoint: `https://${config.AWS_REGION}.${config.AWS_HOST}`, // ✅ DigitalOcean Spaces endpoint
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID!,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false, // ✅ DigitalOcean prefers virtual-hosted-style
});


export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15_000,
  });

  return Buffer.from(response.data);
}



const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};

type FileType = "img" | "audio" | "docs";

const fileExtensionsMap: Record<FileType, string[]> = {
  img: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avatar", "documents"],
  audio: ["mp3", "wav", "aac", "ogg", "m4a", "auido"],
  docs: ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "ppt", "pptx", "documents", "contracts"],
};

function isFileTypeMatch(key: string, type: FileType): boolean {
  const extension = key.split("/")[0]?.toLowerCase();
  console.log(extension)
  if (!extension) return false;
  return fileExtensionsMap[type].includes(extension);
}

export async function readS3Object(
  key: string,
  type?: FileType
): Promise<string | null> {
  try {
    if (type && !isFileTypeMatch(key, type)) {
      return null;
    }

    const bucketName = config.AWS_BUCKET;
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    // Generate a signed URL for S3 object access
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return signedUrl;
  } catch (error: any) {
    console.error("S3 read error:", error.message || error);
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      console.warn(`Object "${key}" does not exist.`);
      return null;
    }
    throw error;
  }
}

export async function getS3SignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  try {
    const bucketName = config.AWS_BUCKET;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  } catch (error: any) {
    console.error('Failed to generate signed URL:', error.message || error);
    throw error;
  }
}

interface InsertS3ObjectParams {
  key: string;
  fileContents: Buffer | string;
}


export async function insertS3Object({
  key,
  fileContents,
}: InsertS3ObjectParams): Promise<any> {

  try {
    // Step 1: Upload file to S3
    const putCommand = new PutObjectCommand({
      Bucket: config.AWS_BUCKET,
      Key: key,
      Body: fileContents,
      ACL: "private",
    });

    await s3.send(putCommand);
  } catch (error: any) {
    console.error("Upload to S3 or API failed:", error.message || error);
    throw error;
  }
}