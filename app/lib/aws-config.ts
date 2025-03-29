import { S3Client } from '@aws-sdk/client-s3';

let s3ClientInstance: S3Client | null = null;

// Only create the S3 client on the server side
const createS3Client = () => {
  if (typeof window === 'undefined') {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials are not configured');
      return null;
    }

    if (!s3ClientInstance) {
      s3ClientInstance = new S3Client({
        region: process.env.AWS_REGION || 'us-east-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }

    return s3ClientInstance;
  }
  return null;
};

// Ensure we create a new instance for each request in server components
export const getS3Client = () => {
  return createS3Client();
};

export const s3Client = createS3Client();
export const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'phx02-radio-uploads'; 