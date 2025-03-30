import { S3Client } from '@aws-sdk/client-s3';

class S3ClientError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'S3ClientError';
    }
}

// Only create the S3 client on the server side
const createS3Client = (): S3Client => {
    if (typeof window !== 'undefined') {
        throw new S3ClientError('S3 client can only be created on the server side');
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new S3ClientError('AWS credentials are not configured');
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
    if (!s3ClientInstance) {
        throw new S3ClientError('Failed to initialize S3 client');
    }
    return s3ClientInstance;
};

// Export bucket name
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'phx02-radio-uploads'; 