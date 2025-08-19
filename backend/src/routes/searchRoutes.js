import express from 'express';
import {
  globalSearch,
  getSearchSuggestions,
  advancedSearch
} from '../controllers/searchController.js';

const router = express.Router();

// Rutas públicas de búsqueda
router.get('/', globalSearch);
router.get('/suggestions', getSearchSuggestions);
router.get('/advanced', advancedSearch);

export default router;
