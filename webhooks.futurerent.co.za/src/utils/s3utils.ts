/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import config from '../config/config';
import axios from 'axios';
export type FileType = 'img' | 'audio' | 'docs';

const fileExtensionsMap: Record<FileType, string[]> = {
  img: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avatar', 'documents'],
  audio: ['mp3', 'wav', 'aac', 'ogg', 'm4a', 'audio'],
  docs: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx', 'documents', 'contracts'],
};

const s3 = new S3Client({
  region: config.AWS_REGION,
  endpoint: `https://${config.AWS_REGION}.${config.AWS_HOST}`,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID!,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});


export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15_000,
  });

  return Buffer.from(response.data);
}

function getFileExtension(key: string): string | null {
  const ext = key.split('.').pop()?.toLowerCase();
  return ext || null;
}

function isFileTypeMatch(key: string, type: FileType): boolean {
  const ext = getFileExtension(key);
  if (!ext) return false;
  return fileExtensionsMap[type].includes(ext);
}

export async function readS3Object(key: string, type?: FileType): Promise<string | null> {
  try {
    if (type && !isFileTypeMatch(key, type)) return null;

    const bucketName = config.AWS_BUCKET;
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    console.error('S3 read error:', error.message || error);
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`Object "${key}" does not exist.`);
      return null;
    }
    throw error;
  }
}

export async function getS3SignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  try {
    const bucketName = config.AWS_BUCKET;
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  } catch (error: any) {
    console.error('Failed to generate signed URL:', error.message || error);
    throw error;
  }
}

export interface InsertS3ObjectParams {
  key: string;
  fileContents: Buffer | string;
  contentType?: string;
}

export interface InsertS3ObjectResult {
  success: boolean;
  key: string;
  contentType: string;
  url: string;
}

export async function insertS3Object({
  key,
  fileContents,
  contentType,
}: InsertS3ObjectParams): Promise<InsertS3ObjectResult> {
  try {
    const detectedType = contentType || mime.lookup(key) || 'application/octet-stream';

    const putCommand = new PutObjectCommand({
      Bucket: config.AWS_BUCKET,
      Key: key,
      Body: fileContents,
      ACL: 'private',
      ContentType: detectedType,
    });

    await s3.send(putCommand);

    const signedUrl = await getS3SignedUrl(key, 3600);

    return {
      success: true,
      key,
      contentType: detectedType,
      url: signedUrl,
    };
  } catch (error: any) {
    console.error('Upload to S3 failed:', error.message || error);
    throw error;
  }
}
