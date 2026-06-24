import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;
  private isValid = false;

  async onModuleInit() {
    try {
      await this.configure();
    } catch (err: any) {
      this.logger.error(`Cloudinary startup validation failed: ${err.message}`);
      throw err;
    }
  }

  private async configure() {
    if (this.isConfigured) return;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error(
        `Cloudinary Configuration Invalid: Missing credentials. ` +
        `CLOUDINARY_CLOUD_NAME: ${cloudName ? 'OK' : 'MISSING'}, ` +
        `CLOUDINARY_API_KEY: ${apiKey ? 'OK' : 'MISSING'}, ` +
        `CLOUDINARY_API_SECRET: ${apiSecret ? 'PRESENT' : 'MISSING'}.`
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

      // Perform diagnostic ping check to verify credentials validity
      await cloudinary.api.ping();

      this.isConfigured = true;
      this.isValid = true;
      this.logger.log('Cloudinary Connected');
    } catch (configError: any) {
      this.isConfigured = true;
      this.isValid = false;
      this.logger.error(`Cloudinary Configuration Invalid: ${configError.message}`);
    }
  }

  async uploadImage(
    base64Data: string,
    mimeType: string = 'image/jpeg',
  ): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured) {
      await this.configure();
    }
    if (!this.isValid) {
      throw new Error('Cloudinary uploads are disabled because the configuration is invalid.');
    }

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
      if (!this.isConfigured) {
        await this.configure();
      }
      if (!this.isValid) {
        this.logger.warn('Cloudinary delete skipped: invalid configuration.');
        return;
      }
      this.logger.log(`Deleting image from Cloudinary: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`);
    }
  }
}
