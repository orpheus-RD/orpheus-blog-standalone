/**
 * Storage Service
 * 
 * Provides file storage using AWS S3 or S3-compatible services (Cloudflare R2, MinIO).
 * Replaces Manus storage proxy with direct S3 SDK calls.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./_core/config";

// ============================================================================
// S3 Client Singleton
// ============================================================================

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3Client) {
    return _s3Client;
  }

  const { s3 } = config.storage;

  if (!s3.accessKeyId || !s3.secretAccessKey || !s3.bucket) {
    throw new Error(
      "S3 storage not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET environment variables."
    );
  }

  const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: s3.region,
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
  };

  // Support S3-compatible services (Cloudflare R2, MinIO)
  if (s3.endpoint) {
    clientConfig.endpoint = s3.endpoint;
    clientConfig.forcePathStyle = true; // Required for MinIO
  }

  _s3Client = new S3Client(clientConfig);
  return _s3Client;
}

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Upload a file to S3
 * 
 * @param key - The S3 object key (path)
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object containing the key and public URL
 */
export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const { bucket, region, endpoint } = config.storage.s3;
  
  // Normalize key (remove leading slashes)
  const normalizedKey = key.replace(/^\/+/, "");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: normalizedKey,
    Body: typeof data === "string" ? Buffer.from(data) : data,
    ContentType: contentType,
    // Make objects publicly readable
    ACL: "public-read",
  });

  await s3.send(command);

  // Construct public URL
  let url: string;
  if (endpoint) {
    // For S3-compatible services, construct URL based on endpoint
    // Cloudflare R2 public URL format: https://pub-{hash}.r2.dev/{key}
    // For custom domains, use the bucket as subdomain or path
    url = `${endpoint}/${bucket}/${normalizedKey}`;
  } else {
    // Standard S3 URL
    url = `https://${bucket}.s3.${region}.amazonaws.com/${normalizedKey}`;
  }

  return { key: normalizedKey, url };
}

/**
 * Get a signed URL for downloading a file
 * 
 * @param key - The S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed download URL
 */
export async function storageGet(
  key: string,
  expiresIn: number = 3600
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const { bucket } = config.storage.s3;
  
  const normalizedKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: normalizedKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });

  return { key: normalizedKey, url };
}

/**
 * Delete a file from S3
 * 
 * @param key - The S3 object key
 */
export async function storageDelete(key: string): Promise<void> {
  const s3 = getS3Client();
  const { bucket } = config.storage.s3;
  
  const normalizedKey = key.replace(/^\/+/, "");

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: normalizedKey,
  });

  await s3.send(command);
}

/**
 * Generate a presigned URL for direct upload from client
 * 
 * @param key - The S3 object key
 * @param contentType - MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 15 minutes)
 * @returns Presigned upload URL
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 900
): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
  const s3 = getS3Client();
  const { bucket, region, endpoint } = config.storage.s3;
  
  const normalizedKey = key.replace(/^\/+/, "");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: normalizedKey,
    ContentType: contentType,
    ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });

  // Construct public URL
  let publicUrl: string;
  if (endpoint) {
    publicUrl = `${endpoint}/${bucket}/${normalizedKey}`;
  } else {
    publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${normalizedKey}`;
  }

  return { key: normalizedKey, uploadUrl, publicUrl };
}

// ============================================================================
// Storage Availability Check
// ============================================================================

/**
 * Check if storage is properly configured
 */
export function isStorageConfigured(): boolean {
  const { s3 } = config.storage;
  return Boolean(s3.accessKeyId && s3.secretAccessKey && s3.bucket);
}
