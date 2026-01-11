import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// @desc    Get all settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.find({});
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a setting
// @route   POST /api/settings
router.post('/', async (req, res) => {
    const { key, value } = req.body;
    try {
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
