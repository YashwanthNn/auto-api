// src/server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import monitorRoutes from './monitor-routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middlewares
app.use(cors({
    // Allow the Vite development server to communicate with the backend
    origin: `http://localhost:${process.env.VITE_PORT || 5173}`, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json()); // For parsing application/json

// 🔑 Authentication Middleware (MVP)
// In a real app, this would validate a JWT token sent by the client (e.g., from Supabase session).
// For the hackathon MVP, we'll keep it simple and rely on RLS/client-side security where possible.
const authMiddleware = (req, res, next) => {
    // A robust check would look like:
    // const token = req.headers.authorization?.split(' ')[1];
    // try { const { data } = await supabase.auth.getUser(token); req.userId = data.user.id; }
    // For now, we skip verification since the client will handle the user ID in the payload.
    next();
};

// Routes
app.use('/api/monitor', authMiddleware, monitorRoutes);

app.get('/', (req, res) => {
    res.send('API Sentinel Backend Running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 API Sentinel backend running on http://localhost:${PORT}`);
});