var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthModel } from '../models/Auth.models.js';
import { UserModel } from '../models/User.models.js';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME, } from '../constants/User.contants.js';
const env = process.env.NODE_ENVx;
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = yield bcrypt.hash(password, 10);
        const user = new UserModel({ name, email, password: hashedPassword });
        yield user.save();
        res.status(201).send('User registered successfully');
    }
    catch (error) {
        res.status(500).send('Error registering user');
    }
});
export const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield UserModel.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'User not found' });
        // Check password
        const validPassword = yield bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ message: 'Invalid password' });
        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            email: user.email,
        });
        const refreshToken = generateRefreshToken({
            _id: user._id.toString(),
            email: user.email,
        });
        // Save refresh token
        yield AuthModel.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // TTL 7 days
        });
        // Setup cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env === 'production' || false, // only use HTTPS in production
            sameSite: 'lax', // better usability while still providing reasonable security
            maxAge: 7 * 24 * 60 * 60 * 1000, // TTL 7 days
        });
        res.json({ accessToken, email: user.email, name: user.name });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
export const refreshTokenUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(403).json({ message: 'Refresh token not provided' });
    }
    try {
        const tokenDoc = yield AuthModel.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        if (tokenDoc.expiresAt < new Date()) {
            yield AuthModel.deleteOne({ _id: tokenDoc._id });
            return res.status(403).json({ message: 'Refresh token expired' });
        }
        const user = yield UserModel.findById(tokenDoc.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            email: user.email,
        });
        tokenDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // TTL 7 days
        yield tokenDoc.save();
        res.json({ accessToken });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
function generateAccessToken(user) {
    var _a;
    return jwt.sign({ userId: user._id, email: user.email }, (_a = process.env.ACCESS_TOKEN_SECRET) !== null && _a !== void 0 ? _a : '', { expiresIn: ACCESS_TOKEN_TIME });
}
function generateRefreshToken(user) {
    var _a;
    return jwt.sign({ userId: user._id, email: user.email }, (_a = process.env.REFRESH_TOKEN_SECRET) !== null && _a !== void 0 ? _a : '', { expiresIn: REFRESH_TOKEN_TIME });
}
export const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    try {
        yield AuthModel.deleteOne({ token: refreshToken });
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging out' });
    }
});
export const logoutAllDeviceUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        yield AuthModel.deleteMany({ userId });
        res.json({ message: 'Logged out from all devices' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging out from all devices' });
    }
});
