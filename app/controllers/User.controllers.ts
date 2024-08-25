import bcrypt from 'bcryptjs';
import { AuthModel } from '../models/Auth.models';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.models';
import {
  TLoginUserRes,
  TLogoutAllDeviceUserReq,
  TRefreshToken,
  TRegisterUserReq,
  TUserInfoToken,
} from '../types/User.types';
import { Response } from 'express';
import { TRequest, TResponse } from '../types/Global.types';

export const registerUser = async (
  req: TRequest<{}, TRegisterUserReq, {}>,
  res: Response
) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
};

export const loginUser = async (
  req: TRequest<{}, TRegisterUserReq, {}>,
  res: Response
) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: 'Invalid password' });

    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      username: user.username,
    });

    // Save refresh token
    await AuthModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // TTL 7 days
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshTokenUser = async (
  req: TRequest<{}, TRefreshToken, {}>,
  res: Response
) => {
  const { refreshToken } = req.body;

  try {
    const tokenDoc = await AuthModel.findOne({ token: refreshToken });

    if (!tokenDoc) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    if (tokenDoc.expiresAt < new Date()) {
      await AuthModel.deleteOne({ _id: tokenDoc._id });
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken({
      _id: user._id.toString(),
      username: user.username,
    });

    // Create refresh new token and replace old token
    // Increasing security for user
    const newRefreshToken = generateRefreshToken({
      _id: user._id.toString(),
      username: user.username,
    });
    tokenDoc.token = newRefreshToken;
    tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    await tokenDoc.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid Refresh Token' });
  }
};

function generateAccessToken(user: TUserInfoToken) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user: TUserInfoToken) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

export const logoutUser = async (
  req: TRequest<{}, TRefreshToken, {}>,
  res: Response
) => {
  const { refreshToken } = req.body;
  try {
    await AuthModel.deleteOne({ token: refreshToken });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out' });
  }
};

export const logoutAllDeviceUser = async (
  req: TRequest<{}, TLogoutAllDeviceUserReq, {}>,
  res: Response
) => {
  const { userId } = req.body;
  try {
    await AuthModel.deleteMany({ userId });
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out from all devices' });
  }
};
