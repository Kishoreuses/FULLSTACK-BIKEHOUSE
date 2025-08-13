const User = require('../models/User');
const Bike = require('../models/Bike');

exports.getStats = async (req, res) => {
  const totalSales = await Bike.countDocuments({ sold: true });
  const totalUsers = await User.countDocuments({ role: 'customer' });
  res.json({ totalSales, totalUsers });
};

exports.getUsers = async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('-password');
  res.json(users);
};

exports.getBikes = async (req, res) => {
  const bikes = await Bike.find().populate('owner', 'username');
  res.json(bikes);
};

exports.getSalesReport = async (req, res) => {
  // Group sold bikes by month/year
  const sales = await Bike.aggregate([
    { $match: { sold: true, soldAt: { $ne: null } } },
    {
      $group: {
        _id: { year: { $year: "$soldAt" }, month: { $month: "$soldAt" } },
        sales: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  res.json(sales);
}; 