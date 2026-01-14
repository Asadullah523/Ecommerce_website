import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Coupon from './models/Coupon.js';
import Settings from './models/Settings.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import { connectDB } from './config/db.js';

dotenv.config();
connectDB();

const categories = [
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Audio', slug: 'audio' },
    { name: 'Wearables', slug: 'wearable' },
    { name: 'Accessories', slug: 'accessories' },
];

const coupons = [
    { code: 'WELCOME10', discount: 10, type: 'percentage' },
    { code: 'SAVE20', discount: 20, type: 'fixed' },
];

const settings = [
    { key: 'revenueGoal', value: 0 },
];

const products = [
    {
        name: "Cyberpunk Headphones",
        price: 199.99,
        categories: ["audio", "wearable", "gaming"],
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
            "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&q=80"
        ],
        rating: 4.8,
        reviewCount: 1,
        reviews: [
            {
                userName: 'Alex Chen',
                rating: 5,
                comment: 'Amazing sound quality! Best headphones I\'ve owned.',
                date: '2024-01-15',
                verified: true
            }
        ],
        provider: "Neon Tech Official",
        description: "Premium wireless headphones with active noise cancellation and immersive 3D audio.",
        inStock: true,
    },
    {
        name: "Neon Gaming Mouse",
        price: 79.99,
        categories: ["gaming", "accessories"],
        images: [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80"
        ],
        rating: 4.9,
        reviewCount: 0,
        reviews: [],
        provider: "Neon Tech Official",
        description: "Ultra-responsive gaming mouse with customizable RGB lighting.",
        inStock: true,
    },
    {
        name: "Mechanical Keyboard",
        price: 149.99,
        categories: ["gaming", "accessories"],
        images: [
            "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80"
        ],
        rating: 4.7,
        reviewCount: 0,
        reviews: [],
        provider: "Neon Tech Official",
        description: "Premium mechanical keyboard with hot-swappable switches.",
        inStock: true,
    }
];

const destroyData = async () => {
    try {
        await Product.deleteMany();
        await Category.deleteMany();
        await Coupon.deleteMany();
        await Settings.deleteMany();
        await User.deleteMany();
        await Order.deleteMany();
        await Cart.deleteMany();
        await Wishlist.deleteMany();

        console.log('All Data Destroyed (Clean Slate)!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await Product.deleteMany();
        await Category.deleteMany();
        await Coupon.deleteMany();
        await Settings.deleteMany();

        await Product.insertMany(products);
        await Category.insertMany(categories);
        await Coupon.insertMany(coupons);
        await Settings.insertMany(settings);

        console.log('Sample Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
