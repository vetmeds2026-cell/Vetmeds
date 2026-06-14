



export const getImageBase64 = async (url) => {
  try {
    
    return new Promise((resolve) => {
      
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
        
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==');
      };
      img.src = url;
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==';
  }
};


export const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==";


export const petsBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==";