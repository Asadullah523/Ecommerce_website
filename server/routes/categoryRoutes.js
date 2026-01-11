import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a category
// @route   POST /api/categories
router.post('/', async (req, res) => {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    try {
        const category = new Category({ name, slug });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
