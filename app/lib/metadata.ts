import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, BUCKET_NAME } from './aws-config';

export interface SongMetadata {
  artistName: string;
  songName: string;
  instagramHandle: string;
  songKey: string;
  imageKey: string;
  approved: boolean;
  submittedAt: string;
}

export type MetadataStore = Record<string, SongMetadata>;

const METADATA_KEY = 'metadata/songs.json';

export async function getMetadata(): Promise<MetadataStore> {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    console.log('Getting metadata from S3:', METADATA_KEY);
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: METADATA_KEY,
    });

    const response = await s3Client.send(command);
    const metadata = await response.Body?.transformToString();
    console.log('Raw metadata from S3:', metadata);
    
    if (!metadata) {
      console.log('No metadata found, returning empty object');
      return {};
    }

    const parsed = JSON.parse(metadata);
    console.log('Parsed metadata:', parsed);
    return parsed;
  } catch (error: any) {
    // If the file doesn't exist yet, return an empty object
    if (error.name === 'NoSuchKey') {
      console.log('Metadata file does not exist yet, creating empty metadata');
      await saveMetadata({});
      return {};
    }
    console.error('Error getting metadata:', error);
    throw error;
  }
}

export async function saveMetadata(metadata: MetadataStore): Promise<void> {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    console.log('Saving metadata:', metadata);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: METADATA_KEY,
      Body: JSON.stringify(metadata, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(command);
    console.log('Metadata saved successfully');
  } catch (error) {
    console.error('Error saving metadata:', error);
    throw error;
  }
}

export async function updateMetadata(metadata: Record<string, SongMetadata>): Promise<void> {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    console.log('Updating entire metadata store:', metadata);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: METADATA_KEY,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
      })
    );
    console.log('Metadata store updated successfully');
  } catch (error) {
    console.error('Error updating metadata store:', error);
    throw error;
  }
}

export async function addSongMetadata(songData: Omit<SongMetadata, 'submittedAt' | 'approved'>): Promise<void> {
  try {
    console.log('Adding song metadata:', songData);
    const metadata = await getMetadata();
    
    metadata[songData.songKey] = {
      ...songData,
      approved: false,
      submittedAt: new Date().toISOString(),
    };

    await saveMetadata(metadata);
    console.log('Song metadata added successfully');
  } catch (error) {
    console.error('Error adding song metadata:', error);
    throw error;
  }
}

export async function deleteSongMetadata(songKey: string): Promise<void> {
  try {
    console.log('Deleting song metadata for:', songKey);
    const metadata = await getMetadata();
    delete metadata[songKey];
    await saveMetadata(metadata);
    console.log('Song metadata deleted successfully');
  } catch (error) {
    console.error('Error deleting song metadata:', error);
    throw error;
  }
}

export async function updateSongApproval(songKey: string, approved: boolean): Promise<void> {
  try {
    console.log('Updating song approval:', { songKey, approved });
    const metadata = await getMetadata();
    if (metadata[songKey]) {
      metadata[songKey].approved = approved;
      await saveMetadata(metadata);
      console.log('Song approval updated successfully');
    } else {
      throw new Error(`Song not found in metadata: ${songKey}`);
    }
  } catch (error) {
    console.error('Error updating song approval:', error);
    throw error;
  }
} 