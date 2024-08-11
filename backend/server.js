import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.route.js'
import NotificationRoutes from './routes/noti.route.js'
import connectMongoDB from './db/connectMongodb.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from "cloudinary";

const app = express();
const port = process.env.PORT || 7000;

cloudinary.config({
    cloud_name: process.env.FLODENAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('App is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notification', NotificationRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectMongoDB();
});

