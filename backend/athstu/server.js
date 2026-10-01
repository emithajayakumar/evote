import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import appRoutes from './routes/auth.js'

import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
    console.log(log.trim());
    fs.appendFileSync(path.join(__dirname, 'server.log'), log);
    next();
});

app.use(express.json())
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/auth', appRoutes)

const connectDB = async () => {
    if (!process.env.MONG_URL) {
        console.error('Error: MONG_URL is not defined in .env file');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONG_URL)
    console.log('Successfully connected to MongoDB')
}

connectDB();

app.listen(5000, () => {
    console.log('port is 5000')
})