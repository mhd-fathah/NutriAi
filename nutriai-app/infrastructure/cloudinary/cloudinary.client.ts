import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

export async function uploadImageToCloudinary(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "nutriai/meals",
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto:good" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
}
