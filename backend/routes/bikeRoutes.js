const express = require('express');
const { createBike, getBikes, getBike, updateBike, deleteBike, markAsSold, markAsAvailable, generatePDF, generateBikePDF, bookBike, removeBuyer } = require('../controllers/bikeController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Configure multer to handle multiple file fields
const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'rc', maxCount: 3 },
  { name: 'insurance', maxCount: 3 }
]);

router.post('/', auth, uploadFields, createBike);
router.post('/generate-pdf', auth, generatePDF);
router.get('/', getBikes);
router.get('/:id', getBike);
router.get('/:id/pdf', auth, generateBikePDF);
router.put('/:id', auth, uploadFields, updateBike);
router.delete('/:id', auth, deleteBike);
router.patch('/:id/sold', auth, markAsSold);
router.patch('/:id/available', auth, markAsAvailable);

// Booking endpoints
router.post('/:id/book', auth, bookBike);
router.delete('/:id/book/:buyerId', auth, removeBuyer);

module.exports = router; 