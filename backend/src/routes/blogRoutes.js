import express from 'express';
import multer from 'multer';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadBlogPostImage,
  uploadBlogPostVideo,
  deleteBlogPostImage,
  deleteBlogPostVideo,
  getFeaturedBlogPosts,
  getRecentBlogPosts
} from '../controllers/blogController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Configuración de multer para subida de archivos
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo para videos
  },
  fileFilter: (req, file, cb) => {
    // Aceptar imágenes y videos para el blog
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen o video'), false);
    }
  }
});

// Configuración específica para imágenes
const uploadImage = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB máximo para imágenes
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configuración específica para videos
const uploadVideo = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo para videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video'), false);
    }
  }
});

// Rutas públicas
router.get('/', getAllBlogPosts);
router.get('/featured', getFeaturedBlogPosts);
router.get('/recent', getRecentBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Rutas protegidas (solo autores y admins pueden crear/editar)
router.post('/', authenticateToken, requireRole(['admin']), createBlogPost);
router.put('/:id', authenticateToken, requireRole(['admin']), updateBlogPost);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteBlogPost);

// Subida de archivos
router.post('/:id/upload-image', 
  authenticateToken, 
  requireRole(['admin']), 
  uploadImage.array('image', 10), 
  uploadBlogPostImage
);

router.post('/:id/upload-video', 
  authenticateToken, 
  requireRole(['admin']), 
  uploadVideo.single('video'), 
  uploadBlogPostVideo
);

// Eliminación de archivos
router.delete('/:id/images/:imageId', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteBlogPostImage
);

router.delete('/:id/videos/:videoId', 
  authenticateToken, 
  requireRole(['admin']), 
  deleteBlogPostVideo
);

export default router;
