require('dotenv').config();
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const jwtSecret = 'process.env.JWT_SECRET';

router.post('/save', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Decoded token:', decoded);
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
        if (!Date.now() >= exp * 1000) {
            const refreshToken = req.headers('refresh-token');
            const refreshTokenRes = await fetch('http://192.168.1.228:3000/api/token/refresh', {
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
        res.status(500).json({ message: "Error saving note" });
    }
});

router.get('/today', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;
        const currentDate = new Date().setHours(0, 0, 0, 0);

        const note = await Note.findOne({ userId, date: currentDate });

        if (!note) return res.status(200).json({ content: "" });

        res.status(200).json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching note" });
    }
});

module.exports = router;