import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtros para diferentes tipos de archivos
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Middleware de multer
export const uploadImageMiddleware = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB - Permitir archivos grandes para comprimir
  }
});

export const uploadVideoMiddleware = multer({ 
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

export const uploadPDFMiddleware = multer({ 
  storage: storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
});

// ✅ Función para comprimir imágenes grandes antes de subir a Cloudinary
const compressImageIfNeeded = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    // Si el archivo es menor a 8MB, no necesita compresión
    if (fileSizeInMB <= 8) {
      console.log(`📁 Archivo ${fileSizeInMB.toFixed(2)}MB - No requiere compresión`);
      return filePath;
    }
    
    console.log(`📁 Archivo ${fileSizeInMB.toFixed(2)}MB - Comprimiendo...`);
    
    // Crear nombre para archivo comprimido usando rutas seguras
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    const compressedPath = path.join(dir, `${basename}_compressed${ext}`);
    
    // Comprimir imagen manteniendo calidad visual
    await sharp(filePath)
      .resize(2400, 1800, { // Máximo tamaño razonable
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80, // Buena calidad visual con menos tamaño
        progressive: true
      })
      .toFile(compressedPath);
    
    // Verificar que la compresión funcionó
    const compressedStats = await fs.stat(compressedPath);
    const compressedSizeInMB = compressedStats.size / (1024 * 1024);
    
    console.log(`✅ Compresión exitosa: ${fileSizeInMB.toFixed(2)}MB → ${compressedSizeInMB.toFixed(2)}MB`);
    
    // Eliminar archivo original y retornar el comprimido
    await fs.unlink(filePath);
    return compressedPath;
    
  } catch (error) {
    console.error('❌ Error comprimiendo imagen:', error);
    // Si falla la compresión, retornar archivo original
    return filePath;
  }
};

// Función principal para subir imágenes responsivas (SIN CORTAR)
export const uploadResponsiveImage = async (filePath, folder = 'divanco') => {
  try {
    // ✅ NUEVO: Comprimir imagen si es muy grande
    const optimizedFilePath = await compressImageIfNeeded(filePath);
    
    // Imagen para desktop - NO CORTA, solo limita tamaño máximo
    const desktopUpload = await cloudinary.uploader.upload(optimizedFilePath, {
      folder: `${folder}/desktop`,
      transformation: [
        { 
          width: 1920, 
          height: 1080, 
          crop: 'limit',  // NO corta - solo redimensiona si es más grande
          quality: 'auto:good', 
          format: 'webp',
          fetch_format: 'auto'
        }
      ],
      public_id_suffix: '_desktop'
    });

    // Imagen para mobile - NO CORTA
    const mobileUpload = await cloudinary.uploader.upload(optimizedFilePath, {
      folder: `${folder}/mobile`,
      transformation: [
        { 
          width: 768, 
          height: 576, 
          crop: 'limit',  // NO corta
          quality: 'auto:good', 
          format: 'webp',
          fetch_format: 'auto'
        }
      ],
      public_id_suffix: '_mobile'
    });

    // Thumbnail - ESTA SÍ corta para tener tamaño exacto (para tarjetas, previews)
    const thumbnailUpload = await cloudinary.uploader.upload(optimizedFilePath, {
      folder: `${folder}/thumbnails`,
      transformation: [
        { 
          width: 400, 
          height: 300, 
          crop: 'fill',  // SÍ corta para thumbnail consistente
          quality: 'auto:good', 
          format: 'webp',
          gravity: 'center' // Centra el recorte
        }
      ],
      public_id_suffix: '_thumb'
    });

    // Eliminar archivo temporal (optimizado)
    await fs.unlink(optimizedFilePath);

    return {
      desktop: {
        url: desktopUpload.secure_url,
        public_id: desktopUpload.public_id,
        width: desktopUpload.width,
        height: desktopUpload.height,
      },
      mobile: {
        url: mobileUpload.secure_url,
        public_id: mobileUpload.public_id,
        width: mobileUpload.width,
        height: mobileUpload.height,
      },
      thumbnail: {
        url: thumbnailUpload.secure_url,
        public_id: thumbnailUpload.public_id,
        width: thumbnailUpload.width,
        height: thumbnailUpload.height,
      }
    };
  } catch (error) {
    // Limpiar archivos temporales en caso de error
    try {
      await fs.unlink(optimizedFilePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo temporal optimizado:', unlinkError);
    }
    // También intentar limpiar el original si es diferente
    if (optimizedFilePath !== filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error eliminando archivo temporal original:', unlinkError);
      }
    }
    throw new Error(`Error uploading responsive images: ${error.message}`);
  }
};

// Función para subir video optimizado
export const uploadOptimizedVideo = async (filePath, folder = 'divanco') => {
  try {
    const videoUpload = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: `${folder}/videos`,
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
          width: 1920,
          height: 1080,
          crop: 'limit'
        }
      ]
    });

    // Eliminar archivo temporal
    await fs.unlink(filePath);

    return {
      url: videoUpload.secure_url,
      public_id: videoUpload.public_id,
      duration: videoUpload.duration,
      width: videoUpload.width,
      height: videoUpload.height,
      format: videoUpload.format,
      bytes: videoUpload.bytes,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo temporal:', unlinkError);
    }
    throw new Error(`Error uploading video: ${error.message}`);
  }
};

// Función para subir PDF
export const uploadDocument = async (filePath, folder = 'divanco') => {
  try {
    const pdfUpload = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: `${folder}/documents`,
    });

    // Eliminar archivo temporal
    await fs.unlink(filePath);

    return {
      url: pdfUpload.secure_url,
      public_id: pdfUpload.public_id,
      format: pdfUpload.format,
      bytes: pdfUpload.bytes,
      original_filename: pdfUpload.original_filename,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo temporal:', unlinkError);
    }
    throw new Error(`Error uploading document: ${error.message}`);
  }
};

// Función para eliminar múltiples imágenes (responsive set completo)
export const deleteResponsiveImages = async (imageData) => {
  try {
    const deletePromises = [];
    
    if (imageData.desktop?.public_id) {
      deletePromises.push(cloudinary.uploader.destroy(imageData.desktop.public_id));
    }
    if (imageData.mobile?.public_id) {
      deletePromises.push(cloudinary.uploader.destroy(imageData.mobile.public_id));
    }
    if (imageData.thumbnail?.public_id) {
      deletePromises.push(cloudinary.uploader.destroy(imageData.thumbnail.public_id));
    }
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Error deleting responsive images: ${error.message}`);
  }
};

// Función para eliminar video
export const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'video' 
    });
    return result;
  } catch (error) {
    throw new Error(`Error deleting video: ${error.message}`);
  }
};

// Función para eliminar documento
export const deleteDocument = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'raw' 
    });
    return result;
  } catch (error) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
};

// Helpers originales (mantenemos compatibilidad)
export function uploadImage(filePath, folder = 'images') {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
    folder,
    quality: 'auto',
    format: 'webp',
  });
}

export function uploadVideo(filePath, folder = 'videos') {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    folder,
    quality: 'auto',
  });
}

export function uploadPDF(filePath, folder = 'pdfs') {
  return cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
  });
}

export default cloudinary;