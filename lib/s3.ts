import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  maxAttempts: 3,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

export async function uploadToS3(file: Buffer, key: string, contentType: string) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    console.log(`Starting S3 upload for ${key} (${file.length / 1024 / 1024}MB)`);
    await s3Client.send(command);
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    console.log(`Successfully uploaded to ${url}`);
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload ${key}: ${(error as Error).message}`);
  }
}

export async function deleteFromS3(key: string) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully deleted ${key} from S3`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete ${key}: ${(error as Error).message}`);
  }
}

export function getS3Url(key: string) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
} 