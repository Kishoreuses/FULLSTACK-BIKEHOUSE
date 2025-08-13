import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

function Profile() {
  const [profile, setProfile] = useState({});
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [myBikes, setMyBikes] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('sold');
  const [selectedBike, setSelectedBike] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBikeForm, setEditBikeForm] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editImages, setEditImages] = useState([]);
  const [editPreview, setEditPreview] = useState([]);
  const [editRcFiles, setEditRcFiles] = useState([]);
  const [editInsuranceFiles, setEditInsuranceFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('=== FETCHING PROFILE ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Profile data received:', res.data);
        setProfile(res.data);
        setForm(res.data);
        
        // Fetch user's bikes
        const bikeRes = await axios.get('http://localhost:5000/api/bikes?owner=' + res.data._id);
        const filteredBikes = bikeRes.data.filter(b => b.owner && b.owner._id === res.data._id);
        console.log('Bikes data received:', filteredBikes);
        console.log('Booked buyers data:', filteredBikes.map(bike => ({ 
          bikeId: bike._id, 
          bookedBuyers: bike.bookedBuyers 
        })));
        setMyBikes(filteredBikes);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage('Failed to load profile');
        setOpen(true);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Profile image selected:', file.name, file.size, file.type);
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/test-db');
      console.log('Database test response:', res.data);
      setMessage(`Database: ${res.data.message} (${res.data.userCount} users)`);
      setOpen(true);
    } catch (err) {
      console.error('Database test failed:', err);
      setMessage('Database connection failed: ' + err.message);
      setOpen(true);
    }
  };



  const handleUpdate = async e => {
    e.preventDefault();
    try {
      // Password validation
      if (form.password && form.password !== form.confirmPassword) {
        setMessage('Passwords do not match!');
        setOpen(true);
        return;
      }
      
      if (form.password && form.password.length < 6) {
        setMessage('Password must be at least 6 characters long!');
        setOpen(true);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Prepare update data
      const updateData = {};
      const excludedFields = ['cart', '_id', '__v', 'role', 'confirmPassword']; // Fields that shouldn't be updated
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null && form[key] !== '' && !excludedFields.includes(key)) {
          updateData[key] = form[key];
        }
      });
      
      console.log('Frontend update data:', updateData);
      
      let res;
      
      // If there's a profile image, use FormData
      if (profileImage) {
        const formData = new FormData();
        
        // Add form fields
        Object.keys(updateData).forEach(key => {
          formData.append(key, updateData[key]);
        });
        
        // Add profile image
        formData.append('profileImage', profileImage);

        res = await axios.put('http://localhost:5000/api/users/profile', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Use JSON for text-only updates
        res = await axios.put('http://localhost:5000/api/users/profile', updateData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      setProfile(res.data);
      setForm(res.data); // Also update the form state
      setEdit(false);
      setProfileImage(null);
      setProfileImagePreview(null);
      setMessage('Profile updated successfully!');
      setOpen(true);
      
      // Dispatch event to update navbar with profile data
      setTimeout(() => {
        const profileUpdateEvent = new CustomEvent('profileUpdated', {
          detail: { profileData: res.data }
        });
        window.dispatchEvent(profileUpdateEvent);
        console.log('Profile update event dispatched with data:', res.data);
      }, 500); // Small delay to ensure backend has processed the image
    } catch (err) {
      console.error('Update error:', err);
      setMessage(`Update failed: ${err.response?.data?.message || err.message}`);
      setOpen(true);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      // Use setTimeout to ensure clean navigation
      setTimeout(() => {
        window.location.href = '/';
      }, 0);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleDelete = async () => {
    if (profile.role === 'admin') {
      setMessage('Admin account cannot be deleted.');
      setOpen(true);
      return;
    }
    if (window.confirm('Delete your account? This will remove all your data permanently.')) {
      try {
        await axios.delete('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        localStorage.removeItem('token');
        window.location.href = '/';
      } catch (err) {
        setMessage('Account deletion failed');
        setOpen(true);
      }
    }
  };

  const handleMark = async (bike, type) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/bikes/${bike._id}/${type}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(type === 'sold' ? 'Bike marked as sold!' : 'Bike marked as available!');
      setConfirmOpen(false);
      setSelectedBike(null);
      axios.get('http://localhost:5000/api/bikes?owner=' + profile._id).then(bikeRes => setMyBikes(bikeRes.data.filter(b => b.owner && b.owner._id === profile._id)));
    } catch (err) {
      setMessage('Failed to update bike status');
      setConfirmOpen(false);
      setSelectedBike(null);
    }
  };

  const handleEditBike = (bike) => {
    setEditBikeForm(bike);
    setEditPreview([]);
    setEditImages([]);
    setEditRcFiles([]);
    setEditInsuranceFiles([]);
    setEditDialogOpen(true);
  };

  const handleEditBikeChange = e => setEditBikeForm({ ...editBikeForm, [e.target.name]: e.target.value });

  const handleEditImageChange = e => {
    setEditImages([...e.target.files]);
    setEditPreview([...e.target.files].map(file => URL.createObjectURL(file)));
  };

  const handleEditRcChange = e => {
    setEditRcFiles([...e.target.files]);
  };

  const handleEditInsuranceChange = e => {
    setEditInsuranceFiles([...e.target.files]);
  };

  const handleEditBikeSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Add form fields
      Object.entries(editBikeForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          data.append(k, v);
        }
      });
      
      // Add bike images
      editImages.forEach(img => data.append('images', img));
      
      // Add RC files
      editRcFiles.forEach(file => data.append('rc', file));
      
      // Add insurance files
      editInsuranceFiles.forEach(file => data.append('insurance', file));
      
      console.log('Submitting bike update with data:', {
        formData: Object.fromEntries(data.entries()),
        images: editImages.length,
        rcFiles: editRcFiles.length,
        insuranceFiles: editInsuranceFiles.length
      });
      
      const response = await axios.put(`http://localhost:5000/api/bikes/${editBikeForm._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Bike update response:', response.data);
      setMessage('Bike updated successfully!');
      setEditDialogOpen(false);
      
      // Reset file states
      setEditImages([]);
      setEditPreview([]);
      setEditRcFiles([]);
      setEditInsuranceFiles([]);
      
      // Refresh bike list
      const bikeRes = await axios.get('http://localhost:5000/api/bikes?owner=' + profile._id);
      setMyBikes(bikeRes.data.filter(b => b.owner && b.owner._id === profile._id));
    } catch (err) {
      console.error('Bike update error:', err);
      setMessage(`Failed to update bike: ${err.response?.data?.message || err.message}`);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteBike = (bike) => {
    setSelectedBike(bike);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBikeConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/bikes/${selectedBike._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Bike deleted!');
      setDeleteDialogOpen(false);
      setSelectedBike(null);
      axios.get('http://localhost:5000/api/bikes?owner=' + profile._id).then(bikeRes => setMyBikes(bikeRes.data.filter(b => b.owner && b.owner._id === profile._id)));
    } catch (err) {
      setMessage('Failed to delete bike');
      setDeleteDialogOpen(false);
      setSelectedBike(null);
    }
  };

  const handleRemoveBuyer = async (bikeId, buyerId) => {
    if (!window.confirm('Remove this buyer from bookings?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bikes/${bikeId}/book/${buyerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh bikes
      const bikeRes = await axios.get('http://localhost:5000/api/bikes?owner=' + profile._id);
      setMyBikes(bikeRes.data.filter(b => b.owner && b.owner._id === profile._id));
      setMessage('Buyer removed!');
      setOpen(true);
    } catch (error) {
      setMessage(error.response?.data || 'Failed to remove buyer');
      setOpen(true);
    }
  };

  return (
    <div className="container-fluid py-5 animate__animated animate__fadeIn" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh' 
    }}>
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Profile Header Card */}
          <div className="card shadow-lg border-0 mb-5 rounded-4" style={{ 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="card-body p-5">
              <div className="row align-items-center">
                <div className="col-md-3 text-center mb-4 mb-md-0">
                  <div className="position-relative d-inline-block">
                    <div className="rounded-circle overflow-hidden" style={{ 
                      width: '180px', 
                      height: '180px', 
                      border: '4px solid #667eea',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                    }}>
                      <img
                        src={
                          profileImagePreview 
                            ? profileImagePreview 
                            : profile.profileImage 
                              ? `http://localhost:5000${profile.profileImage}` 
                              : 'https://via.placeholder.com/180x180/667eea/ffffff?text=Profile'
                        }
                        alt="Profile"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    {edit && (
                      <div className="position-absolute bottom-0 end-0">
                        <label className="btn btn-primary btn-sm rounded-circle" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-camera-fill"></i>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 className="fw-bold text-primary mb-2" style={{ fontSize: '3rem' }}>
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-muted mb-0" style={{ fontSize: '1.2rem' }}>
                        @{profile.username}
                      </p>
                      {profile.role === 'admin' && (
                        <span className="badge bg-danger fs-6 px-3 py-2 mt-2">Administrator</span>
                      )}
                    </div>
                    <div className="d-flex gap-3">
                      <button 
                        className="btn btn-outline-danger btn-lg px-4" 
                        onClick={handleLogout}
                        style={{ fontSize: '1.1rem' }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Card */}
          <div className="card shadow-lg border-0 mb-5 rounded-4" style={{ 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="card-body p-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary mb-0" style={{ fontSize: '2.5rem' }}>
                  <i className="bi bi-person-circle me-3"></i>
                  Profile Information
                </h2>
                {!edit && (
                  <div className="d-flex gap-3">
                    <button 
                      className="btn btn-primary btn-lg px-4" 
                      onClick={() => setEdit(true)}
                      style={{ fontSize: '1.2rem' }}
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      Edit Profile
                    </button>
                    <button 
                      className="btn btn-info btn-lg px-4" 
                      onClick={testDatabaseConnection}
                      style={{ fontSize: '1.2rem' }}
                    >
                      <i className="bi bi-database me-2"></i>
                      Test DB
                    </button>
                  </div>
                )}
              </div>

              {edit ? (
                <form onSubmit={handleUpdate} className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Username</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="username" 
                      value={form.username || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>First Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="firstName" 
                      value={form.firstName || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Last Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="lastName" 
                      value={form.lastName || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="phone" 
                      value={form.phone || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Location</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="location" 
                      value={form.location || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Address</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="address" 
                      value={form.address || ''} 
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>New Password</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg" 
                      name="password" 
                      placeholder="Leave blank to keep current password"
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.2rem' }}>Confirm Password</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg" 
                      name="confirmPassword" 
                      placeholder="Confirm new password"
                      onChange={handleChange}
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>
                  <div className="col-12 d-flex gap-3">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg px-5"
                      style={{ fontSize: '1.2rem' }}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-lg px-5" 
                      onClick={() => {
                        setEdit(false);
                        setProfileImage(null);
                        setProfileImagePreview(null);
                      }}
                      style={{ fontSize: '1.2rem' }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                      <h5 className="fw-bold text-primary mb-3" style={{ fontSize: '1.3rem' }}>
                        <i className="bi bi-person me-2"></i>
                        Personal Information
                      </h5>
                      <p className="mb-2" style={{ fontSize: '1.1rem' }}>
                        <span className="fw-semibold text-dark">Phone:</span> 
                        <span className="ms-2">{profile.phone || 'Not provided'}</span>
                      </p>
                      <p className="mb-2" style={{ fontSize: '1.1rem' }}>
                        <span className="fw-semibold text-dark">Location:</span> 
                        <span className="ms-2">{profile.location || 'Not provided'}</span>
                      </p>
                      <p className="mb-0" style={{ fontSize: '1.1rem' }}>
                        <span className="fw-semibold text-dark">Address:</span> 
                        <span className="ms-2">{profile.address || 'Not provided'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 rounded-3" style={{ background: 'rgba(118, 75, 162, 0.1)' }}>
                      <h5 className="fw-bold text-primary mb-3" style={{ fontSize: '1.3rem' }}>
                        <i className="bi bi-shield-check me-2"></i>
                        Account Security
                      </h5>
                      <p className="mb-2" style={{ fontSize: '1.1rem' }}>
                        <span className="fw-semibold text-dark">Role:</span> 
                        <span className="ms-2 badge bg-primary fs-6">{profile.role}</span>
                      </p>
                      <p className="mb-2" style={{ fontSize: '1.1rem' }}>
                        <span className="fw-semibold text-dark">Member Since:</span> 
                        <span className="ms-2">{new Date(profile.createdAt).toLocaleDateString()}</span>
                      </p>
                      {profile.role !== 'admin' && (
                        <button 
                          className="btn btn-outline-danger btn-lg mt-3"
                          onClick={handleDelete}
                          style={{ fontSize: '1.1rem' }}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* My Listings Card */}
          <div className="card shadow-lg border-0 mb-5 rounded-4" style={{ 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="card-body p-5">
              <h3 className="fw-bold text-primary mb-4" style={{ fontSize: '2.5rem' }}>
                <i className="bi bi-bicycle me-3"></i>
                My Listings
              </h3>
              {myBikes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bicycle display-1 text-muted mb-3"></i>
                  <h4 className="text-muted">No bikes listed yet</h4>
                  <p className="text-muted">Start selling your bikes by adding new listings!</p>
                </div>
              ) : (
                <div className="row g-4">
                  {myBikes.map(bike => (
                    <div className="col-md-6 col-lg-4" key={bike._id}>
                      <div className="card h-100 shadow-sm border-0 rounded-3" style={{ 
                        background: 'rgba(255,255,255,0.8)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>{bike.brand} {bike.model}</h5>
                            <span className={`badge ${bike.sold ? 'bg-danger' : 'bg-success'} fs-6 px-3 py-2`}>
                              {bike.sold ? 'SOLD' : 'Available'}
                            </span>
                          </div>
                          <p className="text-muted mb-2" style={{ fontSize: '1rem' }}>
                            <i className="bi bi-geo-alt me-2"></i>
                            {bike.location}
                          </p>
                          <h4 className="text-primary fw-bold mb-3" style={{ fontSize: '1.5rem' }}>
                            ₹{bike.price?.toLocaleString()}
                          </h4>
                          <p className="mb-1"><span className="fw-semibold">No. of Owners:</span> {bike.ownersCount}</p>
                          <p className="mb-1"><span className="fw-semibold">Kilometres Run:</span> {bike.kilometresRun}</p>
                          <p className="mb-1"><span className="fw-semibold">Model Year:</span> {bike.modelYear}</p>
                          <p className="mb-1"><span className="fw-semibold">Posted On:</span> {bike.postedOn ? new Date(bike.postedOn).toLocaleString() : ''}</p>
                          {/* Your Buyers Section */}
                          {Array.isArray(bike.bookedBuyers) && bike.bookedBuyers.length > 0 && (
                            <div className="mt-3">
                              <h6 className="fw-bold mb-2">Your Buyers</h6>
                              <ul className="list-group">
                                {bike.bookedBuyers.filter(buyer => buyer && buyer.userId).map(buyer => (
                                  <li className="list-group-item d-flex align-items-center justify-content-between" key={buyer.userId}>
                                    <span className="d-flex align-items-center">
                                      <Avatar sx={{ bgcolor: '#ffd700', width: 32, height: 32, mr: 1 }}>
                                        {(buyer.username || 'U').charAt(0).toUpperCase()}
                                      </Avatar>
                                      <span className="ms-2">
                                        <strong>{buyer.username || 'Unknown User'}</strong>
                                        <br />
                                        <small className="text-muted">
                                          📞 {buyer.contact || 'No contact'} | 📍 {buyer.location || 'No location'}
                                        </small>
                                      </span>
                                    </span>
                                    <Tooltip title="Remove Buyer">
                                      <IconButton
                                        color="error"
                                        onClick={() => handleRemoveBuyer(bike._id, buyer.userId)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </li>
                                ))}
                                {bike.bookedBuyers.filter(buyer => buyer && buyer.userId).length === 0 && (
                                  <li className="list-group-item text-muted">No valid buyers found.</li>
                                )}
                              </ul>
                            </div>
                          )}
                          <div className="d-flex gap-2 flex-wrap">
                            <button 
                              className="btn btn-outline-primary btn-sm" 
                              onClick={() => handleEditBike(bike)}
                              style={{ fontSize: '0.9rem' }}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm" 
                              onClick={() => handleDeleteBike(bike)}
                              style={{ fontSize: '0.9rem' }}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                            {bike.sold ? (
                              <button 
                                className="btn btn-outline-success btn-sm" 
                                onClick={() => { setSelectedBike(bike); setConfirmType('available'); setConfirmOpen(true); }}
                                style={{ fontSize: '0.9rem' }}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Mark Available
                              </button>
                            ) : (
                              <button 
                                className="btn btn-outline-warning btn-sm" 
                                onClick={() => { setSelectedBike(bike); setConfirmType('sold'); setConfirmOpen(true); }}
                                style={{ fontSize: '0.9rem' }}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Mark Sold
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Card */}
          <div className="card shadow-lg border-0 rounded-4" style={{ 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="card-body p-5">
              <h4 className="fw-bold text-primary mb-4" style={{ fontSize: '2rem' }}>
                <i className="bi bi-graph-up me-3"></i>
                Seller Analytics
              </h4>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="text-center p-4 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <i className="bi bi-bicycle display-4 text-primary mb-3"></i>
                    <h3 className="fw-bold text-primary" style={{ fontSize: '2.5rem' }}>{myBikes.length}</h3>
                    <p className="mb-0" style={{ fontSize: '1.2rem' }}>Bikes Listed</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-4 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                    <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                    <h3 className="fw-bold text-success" style={{ fontSize: '2.5rem' }}>{myBikes.filter(b => b.sold).length}</h3>
                    <p className="mb-0" style={{ fontSize: '1.2rem' }}>Bikes Sold</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-4 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                    <i className="bi bi-currency-rupee display-4 text-warning mb-3"></i>
                    <h3 className="fw-bold text-warning" style={{ fontSize: '2.5rem' }}>
                      ₹{myBikes.filter(b => b.sold).reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString()}
                    </h3>
                    <p className="mb-0" style={{ fontSize: '1.2rem' }}>Total Sales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem' }}>
                  {confirmType === 'sold' ? 'Mark as Sold' : 'Mark as Available'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setConfirmOpen(false)}></button>
              </div>
              <div className="modal-body pt-0">
                <p style={{ fontSize: '1.1rem' }}>
                  Are you sure you want to {confirmType === 'sold' ? 'mark this bike as sold' : 'mark this bike as available'}?
                </p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary btn-lg px-4" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button 
                  className={`btn btn-${confirmType === 'sold' ? 'warning' : 'success'} btn-lg px-4`} 
                  onClick={() => handleMark(selectedBike, confirmType)}
                >
                  {confirmType === 'sold' ? 'Mark as Sold' : 'Mark as Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bike Modal */}
      {editDialogOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem' }}>Edit Bike</h5>
                <button type="button" className="btn-close" onClick={() => setEditDialogOpen(false)}></button>
              </div>
              <div className="modal-body pt-0">
                <form onSubmit={handleEditBikeSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Brand</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="brand" 
                      value={editBikeForm.brand || ''} 
                      onChange={handleEditBikeChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Model</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="model" 
                      value={editBikeForm.model || ''} 
                      onChange={handleEditBikeChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Location</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="location" 
                      value={editBikeForm.location || ''} 
                      onChange={handleEditBikeChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-control form-control-lg" 
                      name="price" 
                      value={editBikeForm.price || ''} 
                      onChange={handleEditBikeChange} 
                      required 
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Description</label>
                    <textarea 
                      className="form-control form-control-lg" 
                      name="description" 
                      value={editBikeForm.description || ''} 
                      onChange={handleEditBikeChange} 
                      required 
                      rows="3"
                    />
                  </div>
                  
                  {/* File Upload Section */}
                  <div className="col-12">
                    <h6 className="fw-bold text-primary mb-3">Documents & Images</h6>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>RC Documents</label>
                    <input 
                      type="file" 
                      className="form-control form-control-lg" 
                      multiple 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                      onChange={handleEditRcChange} 
                    />
                    <small className="text-muted">Upload RC documents (PDF, DOC, or images)</small>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Insurance Documents</label>
                    <input 
                      type="file" 
                      className="form-control form-control-lg" 
                      multiple 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                      onChange={handleEditInsuranceChange} 
                    />
                    <small className="text-muted">Upload insurance documents (PDF, DOC, or images)</small>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Bike Images</label>
                    <input 
                      type="file" 
                      className="form-control form-control-lg" 
                      multiple 
                      accept="image/*" 
                      onChange={handleEditImageChange} 
                    />
                    <small className="text-muted">Upload multiple bike images</small>
                  </div>
                  
                  {/* Current Images Preview */}
                  <div className="col-12">
                    <label className="form-label fw-bold" style={{ fontSize: '1.1rem' }}>Current Images</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {editPreview.length > 0
                        ? editPreview.map((src, i) => <img key={i} src={src} alt="preview" width={80} className="rounded border" />)
                        : (editBikeForm.images || []).map((src, i) => <img key={i} src={`http://localhost:5000${src}`} alt="preview" width={80} className="rounded border" />)
                      }
                    </div>
                  </div>
                  
                  {/* File Upload Status */}
                  <div className="col-12">
                    <div className="alert alert-info">
                      <strong>Files to upload:</strong>
                      <ul className="mb-0 mt-2">
                        {editImages.length > 0 && <li>Bike Images: {editImages.length} file(s)</li>}
                        {editRcFiles.length > 0 && <li>RC Documents: {editRcFiles.length} file(s)</li>}
                        {editInsuranceFiles.length > 0 && <li>Insurance Documents: {editInsuranceFiles.length} file(s)</li>}
                        {editImages.length === 0 && editRcFiles.length === 0 && editInsuranceFiles.length === 0 && 
                          <li>No new files selected</li>
                        }
                      </ul>
                    </div>
                  </div>
                  <div className="col-12 d-flex gap-3">
                    <button type="submit" className="btn btn-primary btn-lg px-4">Save</button>
                    <button type="button" className="btn btn-secondary btn-lg px-4" onClick={() => setEditDialogOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Bike Modal */}
      {deleteDialogOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem' }}>Delete Bike</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteDialogOpen(false)}></button>
              </div>
              <div className="modal-body pt-0">
                <p style={{ fontSize: '1.1rem' }}>
                  Are you sure you want to delete this bike listing? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary btn-lg px-4" onClick={() => setDeleteDialogOpen(false)}>Cancel</button>
                <button className="btn btn-danger btn-lg px-4" onClick={handleDeleteBikeConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar/Alert */}
      {open && (
        <div className="alert alert-info alert-dismissible fade show position-fixed bottom-0 end-0 m-4 shadow-lg" 
             role="alert" 
             style={{ zIndex: 9999, fontSize: '1.1rem' }}>
          <i className="bi bi-info-circle me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setOpen(false)}></button>
        </div>
      )}
    </div>
  );
}

export default Profile;