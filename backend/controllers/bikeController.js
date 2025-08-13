const Bike = require('../models/Bike');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createBike = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);
    
    const images = req.files && req.files.images ? req.files.images.map(f => `/uploads/${f.filename}`) : [];
    const rcFiles = req.files && req.files.rc ? req.files.rc.map(f => `/uploads/${f.filename}`) : [];
    const insuranceFiles = req.files && req.files.insurance ? req.files.insurance.map(f => `/uploads/${f.filename}`) : [];

    console.log('Processed files:', { images, rcFiles, insuranceFiles });

    // Validate required number fields
    const requiredNumberFields = [
      { key: 'ownersCount', label: 'Number of owners' },
      { key: 'kilometresRun', label: 'Kilometres run' },
      { key: 'modelYear', label: 'Model year' },
      { key: 'price', label: 'Price' }
    ];
    for (const field of requiredNumberFields) {
      const value = req.body[field.key];
      if (value === undefined || value === '' || isNaN(Number(value))) {
        return res.status(400).json({ message: `${field.label} is required and must be a valid number.` });
      }
    }

    const bikeData = {
      ...req.body,
      price: Number(req.body.price), // Convert price to number
      color: req.body.color,
      ownersCount: Number(req.body.ownersCount),
      kilometresRun: Number(req.body.kilometresRun),
      modelYear: Number(req.body.modelYear),
      postedOn: req.body.postedOn ? new Date(req.body.postedOn) : Date.now(),
      images,
      rc: rcFiles,
      insurance: insuranceFiles,
      owner: req.user.id
    };

    console.log('Bike data to save:', bikeData);

    const bike = new Bike(bikeData);
    await bike.save();
    console.log('Bike saved successfully:', bike);
    res.status(201).json(bike);
  } catch (err) {
    console.error('Error creating bike:', err); // Added for server-side debugging
    console.error('Error details:', err.message);
    console.error('Validation errors:', err.errors);
    res.status(500).json({ message: err.message });
  }
};

exports.getBikes = async (req, res) => {
  const { location, model, minPrice, maxPrice, owner } = req.query;
  let filter = {};
  if (location) filter.location = location;
  if (model) filter.model = model;
  if (minPrice && maxPrice) filter.price = { $gte: minPrice, $lte: maxPrice };
  if (owner) filter.owner = owner;
  const bikes = await Bike.find(filter).populate('owner', 'username location');
  res.json(bikes);
};

exports.getBike = async (req, res) => {
  const bike = await Bike.findById(req.params.id).populate('owner', 'username location');
  res.json(bike);
};

exports.updateBike = async (req, res) => {
  try {
    console.log('=== UPDATE BIKE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Bike ID:', req.params.id);
    
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    if (bike.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Update basic fields
    Object.assign(bike, req.body);
    if (req.body.color) bike.color = req.body.color;
    if (req.body.ownersCount) bike.ownersCount = Number(req.body.ownersCount);
    if (req.body.kilometresRun) bike.kilometresRun = Number(req.body.kilometresRun);
    if (req.body.modelYear) bike.modelYear = Number(req.body.modelYear);
    if (req.body.postedOn) bike.postedOn = new Date(req.body.postedOn);
    
    // Handle file uploads
    if (req.files) {
      // Handle images
      if (req.files.images && req.files.images.length > 0) {
        bike.images = req.files.images.map(f => `/uploads/${f.filename}`);
        console.log('Updated images:', bike.images);
      }
      
      // Handle RC files
      if (req.files.rc && req.files.rc.length > 0) {
        bike.rc = req.files.rc.map(f => `/uploads/${f.filename}`);
        console.log('Updated RC files:', bike.rc);
      }
      
      // Handle insurance files
      if (req.files.insurance && req.files.insurance.length > 0) {
        bike.insurance = req.files.insurance.map(f => `/uploads/${f.filename}`);
        console.log('Updated insurance files:', bike.insurance);
      }
    }
    
    console.log('Final bike data before save:', bike);
    
    await bike.save();
    console.log('Bike updated successfully:', bike);
    
    res.json(bike);
  } catch (err) {
    console.error('Error updating bike:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    if (bike.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await bike.deleteOne();
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    console.error('Error deleting bike:', err); // Added for server-side debugging
    res.status(500).json({ message: err.message });
  }
};

exports.markAsSold = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(
      req.params.id,
      { sold: true, soldAt: new Date() },
      { new: true }
    );
    res.json(bike);
  } catch (err) {
    console.error('Error marking bike as sold:', err); // Added for server-side debugging
    res.status(500).json({ message: err.message });
  }
};

exports.markAsAvailable = async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(
      req.params.id,
      { sold: false, soldAt: null },
      { new: true }
    );
    res.json(bike);
  } catch (err) {
    console.error('Error marking bike as available:', err); // Added for server-side debugging
    res.status(500).json({ message: err.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { bikeId } = req.body;
    if (!bikeId) {
      console.error('No bikeId provided');
      return res.status(400).json({ message: 'No bikeId provided' });
    }
    const bike = await Bike.findById(bikeId).populate('owner', 'username phone location');
    if (!bike) {
      console.error('Bike not found for id:', bikeId);
      return res.status(404).json({ message: 'Bike not found' });
    }

    // Create PDF document
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${bike.brand}_${bike.model}_details.pdf"`);

    doc.pipe(res);

    doc.fontSize(24).text('Bike Details Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('Basic Information', { underline: true });
    doc.fontSize(12).text(`Brand: ${bike.brand}`);
    doc.fontSize(12).text(`Model: ${bike.model}`);
    doc.fontSize(12).text(`Price: ₹${bike.price.toLocaleString()}`);
    doc.fontSize(12).text(`Location: ${bike.location}`);
    doc.fontSize(12).text(`Color: ${bike.color || 'N/A'}`);
    doc.fontSize(12).text(`Number of Owners: ${bike.ownersCount || 'N/A'}`);
    doc.fontSize(12).text(`Kilometres Run: ${bike.kilometresRun || 'N/A'}`);
    doc.fontSize(12).text(`Model Year: ${bike.modelYear || 'N/A'}`);
    doc.fontSize(12).text(`Posted On: ${bike.postedOn ? new Date(bike.postedOn).toLocaleString() : 'N/A'}`);
    doc.moveDown();

    doc.fontSize(16).text('Description', { underline: true });
    doc.fontSize(12).text(bike.description || 'No description');
    doc.moveDown();

    doc.fontSize(16).text('Owner Information', { underline: true });
    doc.fontSize(12).text(`Name: ${bike.owner?.username || 'N/A'}`);
    doc.fontSize(12).text(`Phone: ${bike.owner?.phone || 'N/A'}`);
    doc.fontSize(12).text(`Location: ${bike.owner?.location || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(16).text('Documents', { underline: true });
    doc.fontSize(12).text(`RC Documents: ${bike.rc && bike.rc.length > 0 ? `${bike.rc.length} file(s)` : 'Not available'}`);
    doc.fontSize(12).text(`Insurance Documents: ${bike.insurance && bike.insurance.length > 0 ? `${bike.insurance.length} file(s)` : 'Not available'}`);
    doc.moveDown();

    if (bike.images && bike.images.length > 0) {
      doc.fontSize(16).text('Images', { underline: true });
      doc.fontSize(12).text(`${bike.images.length} image(s) available`);
      doc.moveDown();
      const path = require('path');
      const fs = require('fs');
      for (const img of bike.images) {
        const imgPath = path.join(__dirname, '..', img);
        if (fs.existsSync(imgPath)) {
          doc.image(imgPath, { width: 200 }).moveDown();
        }
      }
    }

    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
  }
};

exports.generateBikePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const Bike = require('../models/Bike');
    const bike = await Bike.findById(id).populate('owner');
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    const doc = new PDFDocument({ autoFirstPage: false });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bike_${bike._id}.pdf"`);

    doc.addPage();
    doc.fontSize(24).text(`${bike.brand} ${bike.model}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('Owner Details:', { underline: true });
    doc.fontSize(12).text(`Name: ${bike.owner?.username || 'N/A'}`);
    doc.text(`Location: ${bike.location}`);
    doc.text(`Price: ₹${bike.price}`);
    doc.text(`Description: ${bike.description}`);
    doc.fontSize(12).text(`Color: ${bike.color || 'N/A'}`);
    doc.fontSize(12).text(`Number of Owners: ${bike.ownersCount || 'N/A'}`);
    doc.fontSize(12).text(`Kilometres Run: ${bike.kilometresRun || 'N/A'}`);
    doc.fontSize(12).text(`Model Year: ${bike.modelYear || 'N/A'}`);
    doc.fontSize(12).text(`Posted On: ${bike.postedOn ? new Date(bike.postedOn).toLocaleString() : 'N/A'}`);
    doc.moveDown();

    // Bike Images
    if (bike.images && bike.images.length > 0) {
      doc.fontSize(16).text('Bike Images:', { underline: true });
      for (const img of bike.images) {
        const imgPath = path.join(__dirname, '..', img);
        if (fs.existsSync(imgPath)) {
          doc.image(imgPath, { width: 200 }).moveDown();
        }
      }
    }

    // RC Files
    if (bike.rc && bike.rc.length > 0) {
      doc.fontSize(16).text('RC Files:', { underline: true });
      for (const rc of bike.rc) {
        const rcPath = path.join(__dirname, '..', rc);
        if (fs.existsSync(rcPath)) {
          doc.image(rcPath, { width: 200 }).moveDown();
        }
      }
    }

    // Insurance Files
    if (bike.insurance && bike.insurance.length > 0) {
      doc.fontSize(16).text('Insurance Files:', { underline: true });
      for (const ins of bike.insurance) {
        const insPath = path.join(__dirname, '..', ins);
        if (fs.existsSync(insPath)) {
          doc.image(insPath, { width: 200 }).moveDown();
        }
      }
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Book a bike
exports.bookBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    // Check if user has already booked this bike
    const alreadyBooked = bike.bookedBuyers.some(buyer => 
      buyer.userId.toString() === req.user.id
    );
    
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You have already booked this bike' });
    }
    
    // Fetch complete user data to get all fields
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add the buyer to the bookedBuyers array with complete user data
    const buyerData = {
      userId: user._id,
      username: user.username || 'Unknown User',
      contact: user.phone || 'No contact',
      location: user.location || 'No location'
    };
    
    console.log('Storing buyer data:', buyerData);
    bike.bookedBuyers.push(buyerData);
    
    await bike.save();
    res.json(bike);
  } catch (error) {
    console.error('Error booking bike:', error);
    res.status(500).json({ message: 'Failed to book bike' });
  }
};

// Remove a buyer from bookings
exports.removeBuyer = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    // Check if the user is the owner of the bike or an admin
    if (bike.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Remove the buyer from bookedBuyers array
    bike.bookedBuyers = bike.bookedBuyers.filter(buyer => 
      buyer.userId.toString() !== req.params.buyerId
    );
    
    await bike.save();
    res.json(bike);
  } catch (error) {
    console.error('Error removing buyer:', error);
    res.status(500).json({ message: 'Failed to remove buyer' });
  }
};
