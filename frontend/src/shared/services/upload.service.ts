/**
 * Upload service — sends file to Asset Service via HTTP.
 */

const ASSET_UPLOAD_URL = 'http://localhost:8088/upload';

export async function uploadImages(files: File[]): Promise<string[]> {
  if (!files.length) return [];

  const form = new FormData();
  for (const file of files) {
    form.append('images', file);
  }

  const res = await fetch(ASSET_UPLOAD_URL, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }

  const data = await res.json();
  return (data.assets || []).map((a: any) => a.url || a.id || 'uploaded');
}
