// Staging QA may fetch the container/debug tools, never GA collection endpoints.
// Scripts/styles keep the existing policy; do not introduce unsafe-eval/inline.
export const STAGING_ANALYTICS_CSP = [
  "connect-src 'self' https://www.googletagmanager.com https://tagassistant.google.com",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://ssl.gstatic.com https://www.gstatic.com",
  "frame-src 'self' https://www.googletagmanager.com https://tagassistant.google.com",
].join("; ")
