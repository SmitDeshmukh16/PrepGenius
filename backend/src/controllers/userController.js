import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, location, phone, landArea, soilType } = req.body;
    
    // Validate the input data
    if (!name || !location || !phone || !landArea || !soilType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the user first
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name;
    user.location = location;
    user.phone = phone;
    user.landArea = landArea;
    user.soilType = soilType;
    user.profileCompleted = true;

    // Save the updated user
    const updatedUser = await user.save();
    
    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile. Please try again.' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar path
    const avatarPath = `/uploads/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({ avatarUrl: avatarPath });
  } catch (error) {
    console.error('Avatar upload error:', error);
    // Delete the uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { notifications },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
};