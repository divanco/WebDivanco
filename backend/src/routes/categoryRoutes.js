import express from 'express';
import multer from 'multer';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getHomepageCategories
} from '../controllers/categoryController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Configuración de multer para subida de archivos
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Rutas públicas (no requieren autenticación)
router.get('/', getAllCategories);
router.get('/homepage', getHomepageCategories);
router.get('/:slug', getCategoryBySlug);

// Rutas protegidas (requieren autenticación y rol de admin)
router.post('/', authenticateToken, requireRole(['admin']), createCategory);
router.put('/:id', authenticateToken, requireRole(['admin']), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteCategory);
router.post('/:id/upload-image', 
  authenticateToken, 
  requireRole(['admin']), 
  upload.single('image'), 
  uploadCategoryImage
);

export default router;
