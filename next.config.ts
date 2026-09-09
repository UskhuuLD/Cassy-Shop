import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Admin product-image uploads go through a Server Action as a base64
    // data URL, which is ~33% larger than the original file — the default
    // 1MB body limit rejects anything but a tiny photo before it even
    // reaches the resize-on-client step.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
