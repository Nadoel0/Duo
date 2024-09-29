const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes').router;
const notesRoutes = require('./routes/notesRoutes');
const codeRoutes = require('./routes/codeRoutes');

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
}));

mongoose.connect('mongodb+srv://imiosons:DOWVscvAMUtkmZ6J@clue.68ozt.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err))

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/note', notesRoutes);
app.use('/api/invites', codeRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));