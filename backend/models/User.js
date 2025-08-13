const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  password: String,
  phone: String,
  location: String,
  address: String,
  profileImage: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bike' }]
});

module.exports = mongoose.model('User', userSchema); 