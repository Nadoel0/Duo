const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const User = mongoose.model('User', userSchema);

module.exports = User;