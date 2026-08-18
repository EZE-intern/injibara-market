import express, { Router } from 'express';
import { registerUser, loginUser } from '../controller/authController.js';

const router: Router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
