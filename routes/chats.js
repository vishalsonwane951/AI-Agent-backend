import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getChatList,
  createChat,
  getChat,
  addMessage,
  deleteChat,
  updateChatTitle,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getChatList);
router.post('/', createChat);
router.get('/:chatId', getChat);
router.post('/:chatId/message', addMessage);
router.delete('/:chatId', deleteChat);
router.put('/:chatId/title', updateChatTitle);

export default router;
