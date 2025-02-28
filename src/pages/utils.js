export const getFormattedUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};
