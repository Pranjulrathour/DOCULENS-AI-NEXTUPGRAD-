import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/binary node modules must stay external to the server bundle —
  // Turbopack/webpack cannot place their compiled addons inside an ESM chunk.
  serverExternalPackages: ["sharp", "tesseract.js", "pdfjs-dist"],
  agentRules: false,
};

export default nextConfig;
