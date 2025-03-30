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

    const region = process.env.AWS_REGION || 'us-east-2';
    const bucket = process.env.S3_BUCKET_NAME || 'phx02-radio-uploads';

    // Log environment status (without exposing values)
    console.log('[aws-config] Environment check:', {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        region,
        bucket
    });

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('[aws-config] Missing AWS credentials');
        throw new S3ClientError('AWS credentials are not configured');
    }

    const client = new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        endpoint: `https://${bucket}.s3.${region}.amazonaws.com`
    });

    console.log('[aws-config] S3 client created successfully');
    return client;
};

// Create a singleton instance for server components
let s3ClientInstance: S3Client | null = null;

export const getS3Client = (): S3Client => {
    if (!s3ClientInstance) {
        console.log('[aws-config] Initializing S3 client...');
        s3ClientInstance = createS3Client();
    }
    if (!s3ClientInstance) {
        console.error('[aws-config] Failed to initialize S3 client');
        throw new S3ClientError('Failed to initialize S3 client');
    }
    return s3ClientInstance;
};

// Export bucket name
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'phx02-radio-uploads'; 