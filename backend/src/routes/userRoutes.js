import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, authorize(['admin']), createUser);
router.get('/', authenticate, authorize(['admin']), getUsers);
router.get('/:id', authenticate, authorize(['admin']), getUserById);
router.put('/:id', authenticate, authorize(['admin']), updateUser);
router.delete('/:id', authenticate, authorize(['admin']), deleteUser);

export default router;