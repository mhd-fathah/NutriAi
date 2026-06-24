import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  private configure() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    base64Data: string,
    mimeType: string = 'image/jpeg',
  ): Promise<{ url: string; publicId: string }> {
    this.configure();
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'nutriai/meals',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
        ],
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.warn(`Cloudinary upload failed: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    this.configure();
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}
