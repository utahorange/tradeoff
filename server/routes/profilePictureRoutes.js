const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../Models/user');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Upload profile picture
router.post('/upload', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user.userId);
        user.profilePicture = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };
        await user.save();

        res.json({ message: 'Profile picture uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get profile picture
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.profilePicture) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }

        res.set('Content-Type', user.profilePicture.contentType);
        res.send(user.profilePicture.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 