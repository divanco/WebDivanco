import express from 'express';
import {
  subscribe,
  unsubscribe,
  generateUnsubscribeToken,
  getSubscriberStats,
  getAllSubscribers,
  exportActiveSubscribers,
  deleteSubscriber
} from '../controllers/subscriberController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/subscribe', subscribe);
router.get('/unsubscribe/:token', unsubscribe);
router.post('/unsubscribe-link', generateUnsubscribeToken);

// Rutas protegidas (solo para administradores)
router.get('/stats', authenticateToken, requireRole(['admin']), getSubscriberStats);
router.get('/list', authenticateToken, requireRole(['admin']), getAllSubscribers);
router.get('/export', authenticateToken, requireRole(['admin']), exportActiveSubscribers);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteSubscriber);

export default router;
