const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
        'audio/m4a', 'audio/webm', 'audio/x-m4a',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

// POST /api/upload — upload a single file
router.post('/', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Return the public URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;
