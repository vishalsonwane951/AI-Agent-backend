import { Chat } from '../models/Chat.js';

export const getChatList = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).select('_id title model createdAt updatedAt');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { model = 'mistralai/mistral-7b-instruct', userMessage, userApiKey } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message required' });
    }

    const chat = new Chat({
      userId: req.userId,
      model,
      userApiKey: userApiKey || null,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Call OpenRouter API
    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key not provided' });
    }

    const reply = await callOpenRouter(model, [{ role: 'user', content: userMessage }], apiKey);

    if (reply) {
      chat.messages.push({
        role: 'assistant',
        content: reply,
      });

      const title = userMessage.substring(0, 50);
      chat.title = title.length === 50 ? title + '...' : title;
    }

    await chat.save();

    res.status(201).json({
      chatId: chat._id,
      title: chat.title,
      model: chat.model,
      messages: chat.messages,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { userMessage, userApiKey } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message required' });
    }

    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.messages.push({
      role: 'user',
      content: userMessage,
    });

    // Call OpenRouter API
    const apiKey = userApiKey || chat.userApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key not provided' });
    }

    const conversationHistory = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await callOpenRouter(chat.model, conversationHistory, apiKey);

    if (reply) {
      chat.messages.push({
        role: 'assistant',
        content: reply,
      });
    }

    await chat.save();

    res.json({
      messages: chat.messages,
      assistantMessage: reply,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, userId: req.userId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChatTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title required' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.userId },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function callOpenRouter(model, messages, apiKey) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Vishal AI Agent',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are Vishal, a highly intelligent and helpful AI agent. You are:
- Friendly, concise, and precise
- Great at coding, writing, analysis, math, and general knowledge
- You use markdown for formatting: **bold**, \`inline code\`, code blocks with triple backticks and language
- When showing code, always specify the language after triple backticks
- Keep responses focused and avoid unnecessary padding`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API Error ${res.status}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}
