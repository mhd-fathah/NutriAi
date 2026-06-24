import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  private configure() {
    if (this.isConfigured) return;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        `Cloudinary is not fully configured. Missing credentials. ` +
        `CLOUDINARY_CLOUD_NAME: ${cloudName ? 'OK' : 'MISSING'}, ` +
        `CLOUDINARY_API_KEY: ${apiKey ? 'OK' : 'MISSING'}, ` +
        `CLOUDINARY_API_SECRET: ${apiSecret ? 'PRESENT' : 'MISSING'}. ` +
        `Image uploads will fallback to Base64 data URIs.`
      );
      throw new Error('Cloudinary credentials are not properly configured.');
    }

    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
    } catch (configError) {
      this.logger.error(`Failed to configure Cloudinary SDK: ${configError.message}`);
      throw configError;
    }
  }

  async uploadImage(
    base64Data: string,
    mimeType: string = 'image/jpeg',
  ): Promise<{ url: string; publicId: string }> {
    this.configure();
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    try {
      this.logger.log('Uploading meal image to Cloudinary...');
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'nutriai/meals',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
        ],
      });
      this.logger.log(`Successfully uploaded image to Cloudinary: ${result.public_id}`);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      if (error.http_code === 403) {
        this.logger.error(
          `Cloudinary upload failed with 403 Forbidden. This typically indicates incorrect credentials ` +
          `(Cloud Name: "${process.env.CLOUDINARY_CLOUD_NAME}", API Key: "${process.env.CLOUDINARY_API_KEY?.substring(0, 4)}***"). ` +
          `Please check your .env configuration.`
        );
      } else {
        this.logger.warn(`Cloudinary upload failed: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      this.configure();
      this.logger.log(`Deleting image from Cloudinary: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}
