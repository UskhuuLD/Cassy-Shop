import "server-only";
import { v2 as cloudinary } from "cloudinary";

const configured =
  !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const isCloudinaryConfigured = configured;

/**
 * Uploads a base64 data URL and returns a hosted image URL.
 * Falls back to returning the data URL as-is when Cloudinary isn't configured,
 * which works for local development/demo but should not be relied on in
 * production (see .env.example for the required CLOUDINARY_* variables).
 */
export async function uploadProductImage(dataUrl: string): Promise<string> {
  if (!configured) {
    return dataUrl;
  }
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "cassy-shop/products",
    resource_type: "image",
  });
  return result.secure_url;
}
