import express from 'express';
import { loginUser, logoutAllDeviceUser, logoutUser, refreshTokenUser, registerUser } from '../controllers/User.controllers';

const router = express.Router();

// router.get('/', getAllUsers);

// router.get('/user', authenToken, getUser);

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/refresh-token', refreshTokenUser);

router.post('/logout', logoutUser);

router.post('/logout-all-device', logoutAllDeviceUser);

export default router;