/**
 * Upload service — sends file to Asset Service via HTTP.
 */

const ASSET_UPLOAD_URL = 'http://localhost:8088/upload';

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(ASSET_UPLOAD_URL, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  const data = await res.json();
  return data.url || data.id || 'uploaded';
}
