const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const userRoutes = require('./routes/userRoutes');
const bikeRoutes = require('./routes/bikeRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/users', userRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/admin', adminRoutes);

// Check if MONGO_URI is available
console.log('MONGO_URI available:', !!process.env.MONGO_URI);
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is not set!');
  console.error('Please create a .env file in the backend directory with your MongoDB Atlas connection string.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Connected to MongoDB Atlas successfully');
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please check your MongoDB Atlas connection string and network connection.');
  process.exit(1);
});

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
}); 