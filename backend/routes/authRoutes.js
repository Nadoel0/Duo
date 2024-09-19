require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = 'process.env.JWT_SECRET';

const generateToken = (user) => {
    const accessToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '3h' });
    const refreshToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
}

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();

        const { accessToken, refreshToken } = generateToken(user);

        await RefreshToken.create({ userId: user._id, token: refreshToken });
        res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateToken(user);

        await RefreshToken.create({ userId: user._id, token: refreshToken });
        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);        
        res.status(500).json({ error: err.message });
    }
});

router.post('/token/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, jwtSecret);
        const existingToken = await RefreshToken.findOne({ token: refreshToken });

        if (!existingToken) return res.status(403).json({ message: 'Invalid refresh token' });

        const user = await User.findById(decoded.userId);
        const { accessToken, newRefreshToken } = generateToken(user);

        await RefreshToken.findByIdAndDelete(existingToken._id);
        await RefreshToken.create({ userId: user._id, token: newRefreshToken });

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token '});
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
}

router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You have access!', userId: req.user.userId });
});

router.post('/logout', async (req, res) => {
    return res.status(200).json({ message: 'Logged out successfully' })
});

module.exports = router;