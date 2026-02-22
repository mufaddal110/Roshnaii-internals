const express = require('express');
const Settings = require('../models/Settings');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(adminAuth);

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/settings/:key - Update setting
router.put('/:key', async (req, res) => {
    try {
        const { value, description } = req.body;
        
        const setting = await Settings.findOneAndUpdate(
            { key: req.params.key },
            { value, description },
            { new: true, upsert: true }
        );

        res.json({ message: 'Setting updated', setting });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize default settings
const initializeSettings = async () => {
    const defaults = [
        { key: 'sessionTimeout', value: 3600, description: 'Login session timeout in seconds' },
        { key: 'poetRegistrationEnabled', value: true, description: 'Allow new poet registrations' },
        { key: 'maintenanceMode', value: false, description: 'Enable maintenance mode' },
        { key: 'featuredPoetryLimit', value: 10, description: 'Number of featured poems on homepage' }
    ];

    for (const def of defaults) {
        await Settings.findOneAndUpdate(
            { key: def.key },
            def,
            { upsert: true }
        );
    }
};

// Call this on server start
initializeSettings().catch(console.error);

module.exports = router;
