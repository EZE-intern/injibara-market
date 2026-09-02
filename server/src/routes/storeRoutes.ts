import express, { Router } from 'express';
import { createStore, getStores, getStoreById } from '../controllers/storeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createStoreSchema } from '../schemas/index.js';

const router: Router = express.Router();

// Public
router.get('/', getStores);
router.get('/:id', getStoreById);

// Private — Seller only, with validation (runs after multer parses multipart)
router.post('/', protect, authorizeRoles('seller', 'admin'), upload.single('logo'), validate(createStoreSchema), createStore);

export default router;
