const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    content: { type: String }
});

noteSchema.index({ userId: 1, date: 1 }, { unique: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;