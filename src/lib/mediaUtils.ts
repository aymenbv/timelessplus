// Check if a URL is a video file
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowercaseUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowercaseUrl.includes(ext));
};
