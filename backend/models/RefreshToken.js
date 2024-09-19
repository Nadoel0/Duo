const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true }
});

const refreshToken = mongoose.model('refreshToken', refreshTokenSchema);

module.exports = refreshToken;