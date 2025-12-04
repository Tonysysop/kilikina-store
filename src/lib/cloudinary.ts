/**
 * Cloudinary Upload Utility
 * Handles image uploads to Cloudinary with progress tracking and error handling
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  folder?: string;
}

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param options - Upload options including progress callback
 * @returns Promise with Cloudinary response containing URL and public_id
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary credentials not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  // Optional folder organization
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  // Note: Transformations are applied via URL, not during upload
  // Images will be optimized when retrieved using getCloudinaryUrl()

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data: CloudinaryUploadResponse = await response.json();
    
    // Call progress callback with 100% on success
    if (options.onProgress) {
      options.onProgress(100);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error('Cloudinary upload failed: Unknown error');
  }
}

/**
 * Delete an image from Cloudinary
 * Note: This requires a server-side implementation for security
 * For now, we'll keep images in Cloudinary even after deletion
 * @param publicId - The Cloudinary public_id of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // This would require server-side implementation with Cloudinary API credentials
  // For now, we'll just log the deletion intent
  console.log(`Image deletion requested for: ${publicId}`);
  // Images will remain in Cloudinary but won't be referenced in the app
}

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId - The Cloudinary public_id
 * @param transformations - Optional transformation parameters
 * @returns Transformed image URL
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations?: string
): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
}
