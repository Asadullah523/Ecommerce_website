// Vercel Serverless Function Entry Point
// CRITICAL: Load environment variables BEFORE importing the app
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

import app from '../server/index.js';

export default app;
