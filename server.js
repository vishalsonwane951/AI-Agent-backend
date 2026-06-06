import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import chatsRoutes from './routes/chats.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log('OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 'Set ✓' : 'Not set ✗');

app.use(express.json());
app.use(cors({
  origin: "https://ai-agent-psi-rust.vercel.app",
  credentials: true,
}));

app.use(express.json());

// Routes
connectDB();

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/users', usersRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
