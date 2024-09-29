const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const InviteCode = mongoose.model('Invitation', invitationSchema);

module.exports = InviteCode;