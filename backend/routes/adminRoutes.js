const express = require('express');
const { getStats, getUsers, getBikes, getSalesReport } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};

router.get('/stats', auth, adminOnly, getStats);
router.get('/users', auth, adminOnly, getUsers);
router.get('/bikes', auth, adminOnly, getBikes);
router.get('/sales-report', auth, adminOnly, getSalesReport);

module.exports = router; 