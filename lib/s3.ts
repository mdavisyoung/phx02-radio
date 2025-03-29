import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
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
    const url = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`;
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
  return `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`;
}

export async function listS3Files() {
  if (!BUCKET_NAME) {
    throw new Error('AWS bucket name not configured');
  }

  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
  });

  const response = await s3Client.send(command);
  
  if (!response.Contents) {
    return [];
  }

  // Get signed URLs for each object
  const files = await Promise.all(
    response.Contents.map(async (object) => {
      if (!object.Key) return null;

      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: object.Key,
      });

      const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      
      return {
        key: object.Key,
        url,
        size: object.Size,
        lastModified: object.LastModified,
      };
    })
  );

  return files.filter(Boolean);
}

export async function getSignedS3Url(key: string) {
  if (!BUCKET_NAME) {
    throw new Error('AWS bucket name not configured');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
} 