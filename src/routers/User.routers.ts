import express from 'express';
import {
  loginUser,
  logoutAllDeviceUser,
  logoutUser,
  refreshTokenUser,
  registerUser,
} from '../controllers/User.controllers.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/refresh-token', refreshTokenUser);

router.post('/logout', authenticateToken, logoutUser);

router.post('/logout-all-device', authenticateToken, logoutAllDeviceUser);

export default router;
