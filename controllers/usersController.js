import { User } from '../models/User.js';

export async function updateSettings(req, res) {
  console.log("call update setting")
  try {
    const userId = req.userId; 
    const { apiKey, model } = req.body;
    console.log('userId',userId)

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        apiKey: apiKey || null,
        preferredModel: model || 'mistralai/mistral-7b-instruct',
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Settings updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferredModel: user.preferredModel,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export async function getSettings(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const user = await User.findById(userId).select('preferredModel');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      preferredModel: user.preferredModel,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
