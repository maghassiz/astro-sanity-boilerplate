// Shared R2 upload helper for import scripts — downloads a remote file and
// re-uploads it to the project's R2 bucket, returning its public URL.
// Images stay on R2 (not Sanity's asset pipeline) per this project's chosen
// architecture: avoids Sanity plan bandwidth/storage overage costs.

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const CONTENT_TYPE_TO_EXT = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

let client;

function getClient() {
  if (client) return client;

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  for (const [name, value] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY })) {
    if (!value) throw new Error(`Missing required env var: ${name} (run with --env-file=.env)`);
  }

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

async function objectExists(bucket, key) {
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads `sourceUrl` and uploads it to R2 under `keyPrefix/<slug>.<ext>`.
 * Skips the re-download/upload if the object already exists (safe to re-run).
 * Returns the public URL, or null if sourceUrl was empty.
 */
export async function mirrorImageToR2(sourceUrl, keyPrefix, slug) {
  if (!sourceUrl) return null;

  const { R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error('Missing required env var: R2_BUCKET_NAME or R2_PUBLIC_URL (run with --env-file=.env)');
  }

  const urlExt = sourceUrl.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase();
  const guessedExt = urlExt && urlExt.length <= 4 ? urlExt : null;

  // We may not know the extension until we've fetched the content-type, but
  // we need the key to check existence first — try the URL-guessed extension,
  // and fall back to fetching if that guess doesn't already exist on R2.
  if (guessedExt) {
    const key = `${keyPrefix}/${slug}.${guessedExt}`;
    if (await objectExists(R2_BUCKET_NAME, key)) {
      return `${R2_PUBLIC_URL}/${key}`;
    }
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download ${sourceUrl}: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'application/octet-stream';
  const ext = guessedExt ?? CONTENT_TYPE_TO_EXT[contentType] ?? 'bin';
  const key = `${keyPrefix}/${slug}.${ext}`;

  const body = Buffer.from(await response.arrayBuffer());
  await getClient().send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}
