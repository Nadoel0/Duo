require('dotenv').config();
const express = require('express');
const router = express.Router();
const InviteCode = require('../models/InviteCode');
const { authenticateToken } = require('./authRoutes');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET;

router.post('/generate', authenticateToken, async (req, res) => {
    const { code } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;
        
        const inviteCode = new InviteCode({
            code,
            ownerId: userId,
        });
        
        await inviteCode.save();
        res.status(201).json({ message: 'Invite code created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
});

router.post('/accept', authenticateToken, async (req, res) => {
    const { code } = req.body;

    try {
        const inviteCode = await InviteCode.findOne({ code });

        if (!inviteCode) return res.status(404).json({ message: 'Invite code not found' });

        const user1 = await User.findById(req.user.userId);
        const user2 = await User.findById(inviteCode.ownerId);

        if (user1.equals(user2._id)) return res.status(400).json({ message: 'You cannot invite yourself!!' });

        user1.partnerId = user2._id;
        user2.partnerId = user1._id;

        await user1.save();
        await user2.save();

        res.status(200).json({ message: 'Invite code accepted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;