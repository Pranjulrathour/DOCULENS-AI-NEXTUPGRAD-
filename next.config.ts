import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/binary node modules must stay external to the server bundle —
  // Turbopack/webpack cannot place their compiled addons inside an ESM chunk.
  // sharp and tesseract.js have native addons and must remain external so
  // their compiled binaries are loaded directly. unpdf's PDF text extraction
  // (used for parsing) doesn't touch native addons — only its optional
  // image-rendering path needs @napi-rs/canvas, which we never call.
  serverExternalPackages: ["sharp", "tesseract.js"],
  agentRules: false,
};

export default nextConfig;
