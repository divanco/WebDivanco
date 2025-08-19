import express from 'express';
import multer from 'multer';
import {
  getAllSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryBySlug,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  uploadSubcategoryImage,
  getFeaturedSubcategories
} from '../controllers/subcategoryController.js';
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

// Rutas públicas
router.get('/', getAllSubcategories);
router.get('/featured', getFeaturedSubcategories);
router.get('/category/:categorySlug', getSubcategoriesByCategory);
router.get('/:categorySlug/:slug', getSubcategoryBySlug);

// Rutas protegidas
router.post('/', authenticateToken, requireRole(['admin']), createSubcategory);
router.put('/:id', authenticateToken, requireRole(['admin']), updateSubcategory);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteSubcategory);
router.post('/:id/upload-image', 
  authenticateToken, 
  requireRole(['admin']), 
  upload.single('image'), 
  uploadSubcategoryImage
);

export default router;
