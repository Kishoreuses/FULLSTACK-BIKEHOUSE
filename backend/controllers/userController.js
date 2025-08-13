const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    console.log('=== SIGNUP DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Request body keys:', Object.keys(req.body));
    
    // Test database connection and schema
    console.log('User model fields:', Object.keys(User.schema.paths));
    console.log('Phone field exists:', User.schema.paths.phone ? 'YES' : 'NO');
    
    const { firstName, lastName, username, password, phone, location, address } = req.body;
    console.log('Extracted values:');
    console.log('- firstName:', firstName);
    console.log('- lastName:', lastName);
    console.log('- username:', username);
    console.log('- phone:', phone);
    console.log('- location:', location);
    console.log('- address:', address);
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      firstName, lastName, username, password: hashedPassword, phone, location, address
    };
    console.log('User data to save:', JSON.stringify(userData, null, 2));
    
    const user = new User(userData);
    console.log('User object before save:', JSON.stringify(user.toObject(), null, 2));
    await user.save();
    console.log('User saved successfully. Final user data:', JSON.stringify(user.toObject(), null, 2));
    
    // Verify the user was saved correctly by fetching it back
    const savedUser = await User.findById(user._id);
    console.log('Verified saved user:', JSON.stringify(savedUser.toObject(), null, 2));
    
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log('=== GET PROFILE DEBUG ===');
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE START ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // First, let's verify the user exists
    const existingUser = await User.findById(req.user.id);
    console.log('Existing user:', existingUser ? 'Found' : 'Not found');
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let updates = {};
    
    // Handle profile image upload
    if (req.file) {
      updates.profileImage = req.file.path;
      console.log('Profile image path:', req.file.path);
    }
    
    // Handle form data
    if (req.body) {
      // Copy all body fields to updates, excluding sensitive/auto-managed fields
      const excludedFields = ['cart', '_id', '__v', 'role']; // Fields that shouldn't be updated via profile form
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== null && !excludedFields.includes(key)) {
          updates[key] = req.body[key];
          console.log(`Adding field ${key}:`, req.body[key]);
        }
      });
    }
    
    console.log('Updates object:', updates);
    
    // Check username uniqueness if username is being updated
    if (updates.username && updates.username !== existingUser.username) {
      const usernameExists = await User.findOne({ 
        username: updates.username, 
        _id: { $ne: req.user.id } 
      });
      
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    // Handle password hashing
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
      console.log('Password hashed');
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }
    
    console.log('Final updates to apply:', updates);
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('Update result:', user ? 'Success' : 'Failed');
    
    if (!user) {
      return res.status(500).json({ message: 'Failed to update user profile' });
    }
    
    // Verify the update by fetching the user again
    const verifiedUser = await User.findById(req.user.id).select('-password');
    console.log('Verified user after update:', verifiedUser);
    
    console.log('=== UPDATE PROFILE END ===');
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user.cart.includes(req.body.bikeId)) {
    user.cart.push(req.body.bikeId);
    await user.save();
  }
  res.json(user.cart);
};

exports.getCart = async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart');
  res.json(user.cart);
};

exports.removeFromCart = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = user.cart.filter(id => id.toString() !== req.body.bikeId);
  await user.save();
  res.json(user.cart);
}; 