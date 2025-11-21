import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        /^http:\/\/localhost:\d+$/,
        'https://food-finding-client.vercel.app', // TODO: Replace with your actual Vercel domain
    ],
    credentials: true,
}));
app.use(express.json());

import foodEntryRoutes from './routes/foodEntryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import path from 'path';

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/entries', foodEntryRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Food Finding API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
