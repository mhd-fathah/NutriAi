import imageCompression from 'browser-image-compression';

export async function compressMealImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2, // 0.2 MB (200 KB) target max size
    maxWidthOrHeight: 1280, // resize if dimension > 1280px
    useWebWorker: true,
    initialQuality: 0.8, // 0.8 compression factor
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `[Image Compression] Original Size: ${(file.size / 1024).toFixed(2)} KB, ` +
      `Compressed Size: ${(compressedFile.size / 1024).toFixed(2)} KB, ` +
      `Reduction: ${(100 - (compressedFile.size / file.size) * 100).toFixed(1)}%`
    );
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed, using original file:', error);
    return file; // Fallback to original if compression fails
  }
}
