import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/binary node modules must stay external to the server bundle —
  // Turbopack/webpack cannot place their compiled addons inside an ESM chunk.
  // pdfjs-dist is ESM-only and cannot be required() as an external package —
  // Next.js must bundle it. sharp and tesseract.js have native addons and
  // must remain external so their compiled binaries are loaded directly.
  serverExternalPackages: ["sharp", "tesseract.js"],
  agentRules: false,
};

export default nextConfig;
