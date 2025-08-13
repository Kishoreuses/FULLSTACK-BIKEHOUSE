const mongoose = require('mongoose');
const bikeSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rc: [String], // Changed to array for multiple files
  insurance: [String], // Changed to array for multiple files
  color: { type: String, required: true },
  ownersCount: { type: Number, required: true },
  kilometresRun: { type: Number, required: true },
  modelYear: { type: Number, required: true },
  postedOn: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  sold: { type: Boolean, default: false },
  soldAt: { type: Date },
  bookedBuyers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      contact: String,
      location: String
    }
  ]
});

// Add pre-save middleware to log validation errors
bikeSchema.pre('save', function(next) {
  console.log('Saving bike with data:', this.toObject());
  next();
});
module.exports = mongoose.model('Bike', bikeSchema);