import express, { Router } from 'express';
import { createStore, getStores, getStoreById } from '../controllers/storeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router: Router = express.Router();

// Public
router.get('/', getStores);
router.get('/:id', getStoreById);

// Private — Seller only
// upload.single('logo') processes the multipart form field named "logo"
router.post('/', protect, authorizeRoles('seller', 'admin'), upload.single('logo'), createStore);

export default router;
