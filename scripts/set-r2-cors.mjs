// One-time setup: allows cross-origin GET requests on the R2 bucket.
// Required for @font-face — browsers enforce CORS on fonts (unlike images),
// so without this a self-hosted font served from R2's domain silently fails
// to load.
// Usage: node --env-file=.env scripts/set-r2-cors.mjs

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

for (const [name, value] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME })) {
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

await client.send(new PutBucketCorsCommand({
  Bucket: R2_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['GET'],
        AllowedHeaders: ['*'],
        MaxAgeSeconds: 3600,
      },
    ],
  },
}));

console.log(`CORS policy set on bucket "${R2_BUCKET_NAME}": public GET allowed from any origin.`);
