// Uploads a local file to the Cloudflare R2 bucket and prints its public URL.
// Usage: node scripts/upload-to-r2.mjs <local-file-path> <remote-key>
// Example: node scripts/upload-to-r2.mjs public/fonts/MyFont-Medium.woff2 fonts/MyFont-Medium.woff2

import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const CONTENT_TYPES = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const [, , localPath, remoteKey] = process.argv;

if (!localPath || !remoteKey) {
  console.error('Usage: node scripts/upload-to-r2.mjs <local-file-path> <remote-key>');
  process.exit(1);
}

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

for (const [name, value] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL })) {
  if (!value) {
    console.error(`Missing required env var: ${name} (load .env first, e.g. run with --env-file=.env)`);
    process.exit(1);
  }
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const body = await readFile(localPath);
const contentType = CONTENT_TYPES[extname(localPath).toLowerCase()] || 'application/octet-stream';

await client.send(new PutObjectCommand({
  Bucket: R2_BUCKET_NAME,
  Key: remoteKey,
  Body: body,
  ContentType: contentType,
}));

console.log(`Uploaded ${localPath} -> ${remoteKey} (${contentType})`);
console.log(`Public URL: ${R2_PUBLIC_URL}/${remoteKey}`);
