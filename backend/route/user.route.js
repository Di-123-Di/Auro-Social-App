import express from 'express';
import bcrypt from 'bcrypt';
import * as userModel from './db/user.model.js';
import * as jwtHelpers from './helpers/jwt.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { uploadToS3 } from '../config/s3.js';

const router = express.Router();


const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


const requireAuth = (req, res, next) => {
  const username = jwtHelpers.decrypt(req.cookies.token);
  if (!username) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.username = username;
  next();
};


const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});


router.get('/validate-token', async (req, res) => {
  try {
    const username = jwtHelpers.decrypt(req.cookies.token);
    if (!username) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});


router.get('/:username', async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      username: user.username,
      joinedAt: user.joinedAt,
      description: user.description,
      status: user.status,
      email: user.email,
      emailVerified: user.emailVerified,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});


router.post('/signup', async (req, res) => {
  try {
    const user = await userModel.createUser({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });
    
    const token = jwtHelpers.generateToken(user.username);
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Signup successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findUserByUsername(username);
    
    if (!user || !await userModel.verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwtHelpers.generateToken(user.username);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      username: user.username,
      _id: user._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});


router.post('/login/email', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    
    if (!user || !await userModel.verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.emailVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }
    
    const token = jwtHelpers.generateToken(user.username);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      username: user.username,
      _id: user._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});


router.post('/verify/email/send', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.email) {
      return res.status(400).json({ error: 'No email address on record' });
    }
    
    const verificationCode = await userModel.generateVerificationCode(user._id);
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Auro Email Verification Code',
      text: `Your verification code is: ${verificationCode}`
    });
    
    res.json({ message: 'Verification code sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});


router.post('/verify/email', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { code } = req.body;
    const isValid = await userModel.verifyCode(user._id, code);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }
    
    await userModel.verifyUserEmail(user._id);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify email' });
  }
});


router.post('/update/email', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { email } = req.body;
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    await userModel.addUserEmail(user._id, email);
    
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update email' });
  }
});


router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const username = req.username;
    
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
   
    const avatarUrl = await uploadToS3(req.file);
    
 
    const updatedUser = await userModel.updateUserAvatar(user._id, avatarUrl);
    
    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});


router.put('/status', requireAuth, async (req, res) => {
  try {
    const username = req.username;
    
    const updatedUser = await userModel.updateUserStatus(username, req.body.status);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ status: updatedUser.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});


router.get('/search/:term', async (req, res) => {
  try {
    const users = await userModel.searchUsers(req.params.term);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;