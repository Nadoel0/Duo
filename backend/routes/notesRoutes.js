require('dotenv').config();
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./authRoutes');

const jwtSecret = process.env.JWT_SECRET;

router.post('/save', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.headers['refresh-token'];
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;
        const { content } = req.body;
        const currentDate = new Date().setHours(0, 0, 0, 0);

        let note = await Note.findOne({ userId, date: currentDate });

        if (note) {
            note.content = content;
            await note.save();
        } else {
            note = new Note({
                userId,
                date: currentDate,
                content
            });
            await note.save();
        }

        const { exp } = jwt.decode(token);
        if (Date.now() >= exp * 1000) {
            const refreshToken = req.headers['refresh-token'];
            const refreshTokenRes = await fetch('http://192.168.31.127:3000/api/token/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });
            const { accessToken, refreshToken: newRefreshToken } = await refreshTokenRes.json();
            res.setHeader('New-Access-Token', accessToken);
            res.setHeader('New-Refresh-Token', newRefreshToken)
        }

        res.status(200).json({ message: "Note saved successfully", note });
    } catch (err) {
        console.error(err);
        if (refreshToken) {
            await RefreshToken.findOneAndDelete({ token: refreshToken });
        }
        res.status(500).json({ message: "Error saving note" });
    }
});

router.get('/today', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.headers['refresh-token'];
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try { 
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;
        const currentDate = new Date().setHours(0, 0, 0, 0);       

        const note = await Note.findOne({ userId, date: currentDate });

        if (!note) return res.status(200).json({ content: "" });

        res.status(200).json(note);
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            if (refreshToken) {
                await RefreshToken.findOneAndDelete({ token: refreshToken });
            }
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error(err);
        if (refreshToken) {
            await RefreshToken.findOneAndDelete({ token: refreshToken });
        }
        res.status(500).json({ message: "Error fetching note" });
    }
});

router.get('/partner/today', authenticateToken, async (req, res) => {
    try {
        const userPartner = await User.findById(req.user.userId);
        const currentDate = new Date().setHours(0, 0, 0, 0); 
        const partnerNote = await Note.findOne({ userId: userPartner.partnerId, date: currentDate });

        if (!partnerNote) return res.status(200).json({ content: "" });

        res.status(200).json(partnerNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
});

router.get('/date', async (req, res) => {
    const date = new Date(req.query.date);
    date.setHours(0, 0, 0, 0);
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;
        console.log(`User ID from token: ${userId}`);
        console.log(`Date from user: ${date}`);
        
        const note = await Note.findOne({ userId, date });
        console.log(`Found note: ${note}`);
        
        if (!note) return res.status(200).json({ content: "" });

        res.json(note)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/partner/date', authenticateToken, async (req, res) => {
    const date = new Date(req.query.date);   
    date.setHours(0, 0, 0, 0);

    try {
        const userPartner = await User.findById(req.user.userId);
        const partnerNote = await Note.findOne({ userId: userPartner.partnerId, date });

        if (!partnerNote) return res.status(200).json({ content: "" });

        res.json(partnerNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
});

module.exports = router;