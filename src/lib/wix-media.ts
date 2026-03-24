/**
 * Transform Wix media URIs into publicly accessible URLs.
 *
 * Wix image format:
 *   wix:__image://v1/{fileId}/{filename}#originWidth=W&originHeight=H__
 *   → https://static.wixstatic.com/media/{fileId}
 *
 * Wix video poster format:
 *   posterUri={posterId}
 *   → https://static.wixstatic.com/media/{posterId}
 */

export function wixImageToUrl(wixUri: string | null | undefined): string | null {
  if (!wixUri) return null;
  const match = wixUri.match(/wix:__image:\/\/v1\/([^/]+)\//);
  if (!match) return wixUri; // already a normal URL
  return `https://static.wixstatic.com/media/${match[1]}`;
}

export function wixVideoPosterToUrl(wixUri: string | null | undefined): string | null {
  if (!wixUri) return null;
  const match = wixUri.match(/posterUri=([^&]+)/);
  if (!match) return null;
  return `https://static.wixstatic.com/media/${match[1]}`;
}

export function wixVideoToMp4(wixUri: string | null | undefined): string | null {
  if (!wixUri) return null;
  const match = wixUri.match(/wix:__video:\/\/v1\/([^/]+)\//);
  if (!match) return wixUri;
  return `https://video.wixstatic.com/video/${match[1]}/mp4/file.mp4`;
}
