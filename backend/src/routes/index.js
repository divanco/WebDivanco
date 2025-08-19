import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import projectRoutes from './projectRoutes.js';
import blogRoutes from './blogRoutes.js';
import subscriberRoutes from './subscriberRoutes.js';
import searchRoutes from './searchRoutes.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas del showroom
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);

// Rutas de proyectos
router.use('/projects', projectRoutes);

// Rutas del blog
router.use('/blog', blogRoutes);

// Rutas de suscriptores
router.use('/subscribers', subscriberRoutes);

// Rutas de búsqueda
router.use('/search', searchRoutes);

// Ruta de información del API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Divanco - Estudio de Arquitectura',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      subcategories: '/api/subcategories',
      projects: '/api/projects',
      blog: '/api/blog',
      subscribers: '/api/subscribers',
      search: '/api/search'
    }
  });
});

export default router;