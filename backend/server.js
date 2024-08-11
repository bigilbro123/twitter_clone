import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv'
import connectMongoDB from './db/connectMongodb.js'
const app = express();
const port = process.env.PORT || 7000;
dotenv.config()

app.get('/', (req, res) => {
    res.send('app is running');
});


app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
    connectMongoDB();
});

