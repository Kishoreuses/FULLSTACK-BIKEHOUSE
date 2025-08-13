const express = require('express');
const multer = require('multer');
const {
  signup, login, getProfile, updateProfile, deleteAccount,
  addToCart, getCart, removeFromCart
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Test route to verify database connection and basic operations
router.get('/test-db', async (req, res) => {
  try {
    const User = require('../models/User');
    const count = await User.countDocuments();
    res.json({ 
      message: 'Database connection working', 
      userCount: count,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

router.get('/profile', auth, getProfile);
router.put('/profile', auth, (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateProfile);
router.delete('/profile', auth, deleteAccount);
router.post('/cart', auth, addToCart);
router.get('/cart', auth, getCart);
router.delete('/cart', auth, removeFromCart);

module.exports = router; 