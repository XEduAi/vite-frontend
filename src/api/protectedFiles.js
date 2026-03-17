import axiosClient from './axiosClient';

const CONTENT_DISPOSITION_FILENAME_PATTERN = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i;

export function extractFilenameFromContentDisposition(value = '') {
  const match = CONTENT_DISPOSITION_FILENAME_PATTERN.exec(value);
  const encodedFilename = match?.[1];
  const plainFilename = match?.[2];

  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename);
    } catch {
      return encodedFilename;
    }
  }

  return plainFilename || '';
}

export async function fetchProtectedFile(url, {
  fallbackName = 'download',
  params,
} = {}) {
  const response = await axiosClient.get(url, {
    params,
    responseType: 'blob',
  });

  const filename = extractFilenameFromContentDisposition(response.headers?.['content-disposition'])
    || fallbackName;

  return {
    blob: response.data,
    filename,
    mimeType: response.headers?.['content-type'] || response.data?.type || 'application/octet-stream',
  };
}

export async function createProtectedObjectUrl(url, options) {
  const file = await fetchProtectedFile(url, options);

  return {
    ...file,
    objectUrl: URL.createObjectURL(file.blob),
  };
}

export async function downloadProtectedFile(url, options) {
  const file = await createProtectedObjectUrl(url, options);
  const link = document.createElement('a');

  link.href = file.objectUrl;
  link.download = file.filename || options?.fallbackName || 'download';
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(file.objectUrl);
  }, 1000);

  return file;
}

