import { S3Client } from '@aws-sdk/client-s3';

// Only create the S3 client on the server side
const createS3Client = (): S3Client => {
    if (typeof window !== 'undefined') {
        throw new Error('S3 client can only be created on the server side');
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials are not configured');
    }

    return new S3Client({
        region: process.env.AWS_REGION || 'us-east-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};

// Create a singleton instance for server components
let s3ClientInstance: S3Client | null = null;

export const getS3Client = (): S3Client => {
    if (!s3ClientInstance) {
        s3ClientInstance = createS3Client();
    }
    return s3ClientInstance;
};

// Export the singleton instance
export const s3Client = getS3Client();

// Export bucket name
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'phx02-radio-uploads'; 