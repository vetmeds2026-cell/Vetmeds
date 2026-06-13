// Utility functions to handle PDF images
// This ensures images are visible in the PDFs

/**
 * Convert image file to base64 string
 * @param {string} url - Path to the image file
 * @returns {Promise<string>} Base64 encoded image string
 */
export const getImageBase64 = async (url) => {
  try {
    // For client-side usage, we'll return a promise that resolves to base64
    return new Promise((resolve) => {
      // Use the built-in browser Image constructor, not Next.js Image
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        // Fallback to a small transparent PNG if image fails to load
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==');
      };
      img.src = url;
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // Return a fallback transparent PNG
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==';
  }
};

/**
 * Logo image in base64 format (pre-converted)
 * This is a placeholder - in a real implementation you would convert your actual logo
 */
export const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==";

/**
 * Pets image in base64 format (pre-converted)
 * This is a placeholder - in a real implementation you would convert your actual pets image
 */
export const petsBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==";