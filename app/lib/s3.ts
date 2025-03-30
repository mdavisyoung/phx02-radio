import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from './aws-config';

export const generateUploadURL = async (key: string, contentType: string): Promise<string> => {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw error;
  }
};

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''; 