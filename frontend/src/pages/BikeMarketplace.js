import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Badge from '@mui/material/Badge';

const brands = [
  'Hero', 'Honda', 'Yamaha', 'Royal Enfield', 'Suzuki', 'Bajaj', 'TVS', 'KTM', 'Other'
];

function BikeMarketplace() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  // Filter states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [bookingLoading, setBookingLoading] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBikes();
    if (token) {
      fetchCartItems();
      fetchUserProfile();
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [bikes, selectedBrand, priceRange, searchQuery, sortBy, userProfile]);



  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/bikes');
      let availableBikes = response.data.filter(bike => !bike.sold);
      
      setBikes(availableBikes);
      setFilteredBikes(availableBikes);
    } catch (error) {
      setAlert({ show: true, message: 'Failed to load bikes', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bikes];
    
    // Filter out user's own bikes if logged in
    if (token && userProfile) {
      filtered = filtered.filter(bike => bike.owner !== userProfile._id);
    }
    
    if (selectedBrand) {
      filtered = filtered.filter(bike => bike.brand === selectedBrand);
    }
    filtered = filtered.filter(bike => bike.price >= priceRange[0] && bike.price <= priceRange[1]);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bike =>
        bike.brand?.toLowerCase().includes(query) ||
        bike.model?.toLowerCase().includes(query) ||
        bike.location?.toLowerCase().includes(query) ||
        bike.description?.toLowerCase().includes(query)
      );
    }
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    setFilteredBikes(filtered);
  };

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data);
    } catch (error) {}
  };

  const handleAddToCart = async (bikeId) => {
    if (!token) {
      setAlert({ show: true, message: 'Please login to add items to cart', type: 'warning' });
      return;
    }
    setCartLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.post('http://localhost:5000/api/users/cart', { bikeId }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCartItems();
      setAlert({ show: true, message: 'Added to cart successfully!', type: 'success' });
    } catch (error) {
      setAlert({ show: true, message: 'Failed to add to cart', type: 'danger' });
    } finally {
      setCartLoading(prev => ({ ...prev, [bikeId]: false }));
    }
  };

  const handleRemoveFromCart = async (bikeId) => {
    setCartLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.delete('http://localhost:5000/api/users/cart', {
        headers: { Authorization: `Bearer ${token}` },
        data: { bikeId }
      });
      await fetchCartItems();
      setAlert({ show: true, message: 'Removed from cart successfully!', type: 'success' });
    } catch (error) {
      setAlert({ show: true, message: 'Failed to remove from cart', type: 'danger' });
    } finally {
      setCartLoading(prev => ({ ...prev, [bikeId]: false }));
    }
  };

  const handleBikeClick = (bike) => {
    setSelectedBike(bike);
    setModalOpen(true);
  };

  const handleBookBike = async (bikeId) => {
    if (!token) {
      setAlert({ show: true, message: 'Please login to book bikes', type: 'warning' });
      return;
    }
    setBookingLoading(prev => ({ ...prev, [bikeId]: true }));
    try {
      await axios.post(`http://localhost:5000/api/bikes/${bikeId}/book`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBikes(); // Refresh list
      setAlert({ show: true, message: 'Bike booked successfully!', type: 'success' });
    } catch (error) {
      setAlert({ show: true, message: error.response?.data || 'Failed to book bike', type: 'danger' });
    } finally {
      setBookingLoading(prev => ({ ...prev, [bikeId]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter Panel
  const FilterPanel = () => (
    <div className="card card-body mb-4 animate__animated animate__fadeIn">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Brand</label>
          <select className="form-select" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
            <option value="">All Brands</option>
              {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Price Range (₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()})</label>
          <div className="d-flex align-items-center gap-2">
            <input type="number" className="form-control" min="0" max="1000000" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} />
            <span className="mx-2">to</span>
            <input type="number" className="form-control" min="0" max="1000000" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} />
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Sort By</label>
          <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Bike Card
  const BikeCard = ({ bike }) => (
    <div className="card h-100 shadow animate__animated animate__fadeInUp" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleBikeClick(bike)}>
      <img
        src={bike.images && bike.images[0] ? `http://localhost:5000${bike.images[0]}` : 'https://via.placeholder.com/300x200?text=No+Image'}
        className="card-img-top"
        alt={bike.model}
        style={{ height: 200, objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold">{bike.brand} {bike.model}</h5>
        <p className="card-text mb-1"><i className="bi bi-geo-alt text-secondary"></i> {bike.location}</p>
        <h4 className="text-primary fw-bold mb-2">{formatPrice(bike.price)}</h4>
        <p className="mb-1"><span className="fw-semibold">No. of Owners:</span> {bike.ownersCount}</p>
        <p className="mb-1"><span className="fw-semibold">Kilometres Run:</span> {bike.kilometresRun}</p>
        <p className="mb-1"><span className="fw-semibold">Model Year:</span> {bike.modelYear}</p>
        <p className="mb-1"><span className="fw-semibold">Posted On:</span> {bike.postedOn ? new Date(bike.postedOn).toLocaleString() : ''}</p>
        <p className="card-text flex-grow-1">{bike.description?.substring(0, 80)}...</p>
        <div className="d-flex gap-2 mt-auto align-items-center">
          <Badge
            badgeContent={bike.bookedBuyers?.length || 0}
            color="warning"
            sx={{ mr: 1 }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <BookmarkIcon color="action" />
          </Badge>
          <button
            className="btn btn-warning btn-sm w-100"
            onClick={e => {
              e.stopPropagation();
              handleBookBike(bike._id);
            }}
            disabled={bookingLoading[bike._id]}
          >
            {bookingLoading[bike._id] ? 'Booking...' : 'Book'}
          </button>
        </div>
        <div className="d-flex gap-2 mt-2">
          {cartItems.some(item => item._id === bike._id) ? (
            <button
              className="btn btn-outline-danger btn-sm w-100"
              onClick={e => { e.stopPropagation(); handleRemoveFromCart(bike._id); }}
              disabled={cartLoading[bike._id]}
            >
              {cartLoading[bike._id] ? 'Removing...' : 'Remove from Cart'}
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={e => { e.stopPropagation(); handleAddToCart(bike._id); }}
              disabled={cartLoading[bike._id]}
            >
              {cartLoading[bike._id] ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Download PDF handler
  const handleDownloadPDF = async (bikeId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/bikes/${bikeId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bike_${bikeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Bike Details Modal
  const BikeDetailsModal = () => (
    <div className={`modal fade ${modalOpen ? 'show d-block' : ''}`} tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content animate__animated animate__fadeInDown">
          <div className="modal-header">
            <h4 className="modal-title fw-bold">{selectedBike?.brand} {selectedBike?.model}</h4>
            <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
          </div>
          <div className="modal-body">
            <div className="row g-4">
              <div className="col-md-6">
                <img
                  src={selectedBike?.images && selectedBike?.images[0] ? `http://localhost:5000${selectedBike.images[0]}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={selectedBike?.model}
                  className="img-fluid rounded mb-2"
                  style={{ height: 300, objectFit: 'cover', width: '100%' }}
                />
                {selectedBike?.images && selectedBike.images.length > 1 && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {selectedBike.images.slice(1, 5).map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${image}`}
                        alt={`${selectedBike.model} ${index + 2}`}
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <h4 className="text-primary fw-bold mb-2">{formatPrice(selectedBike?.price)}</h4>
                <h6 className="fw-bold">Specifications</h6>
                <div className="row mb-2">
                  <div className="col-6"><span className="text-secondary">Brand:</span> <span className="fw-semibold">{selectedBike?.brand}</span></div>
                  <div className="col-6"><span className="text-secondary">Model:</span> <span className="fw-semibold">{selectedBike?.model}</span></div>
                  <div className="col-6"><span className="text-secondary">Location:</span> <span className="fw-semibold">{selectedBike?.location}</span></div>
                  <div className="col-6"><span className="text-secondary">Owner:</span> <span className="fw-semibold">{selectedBike?.owner?.username || 'N/A'}</span></div>
                </div>
                <h6 className="fw-bold mt-3">Description</h6>
                <p>{selectedBike?.description}</p>
                <h6 className="fw-bold mt-3">Documents</h6>
                <div className="row">
                  <div className="col-6"><span className="text-secondary">RC Documents:</span> <span className="fw-semibold">{selectedBike?.rc && selectedBike.rc.length > 0 ? `${selectedBike.rc.length} file(s)` : 'Not available'}</span></div>
                  <div className="col-6"><span className="text-secondary">Insurance:</span> <span className="fw-semibold">{selectedBike?.insurance && selectedBike.insurance.length > 0 ? `${selectedBike.insurance.length} file(s)` : 'Not available'}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
            <button className="btn btn-outline-primary" onClick={() => handleDownloadPDF(selectedBike._id)}>
              Download PDF
            </button>
            {cartItems.some(item => item._id === selectedBike?._id) ? (
              <button
                className="btn btn-outline-danger"
                onClick={() => { handleRemoveFromCart(selectedBike._id); setModalOpen(false); }}
              >Remove from Cart</button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => { handleAddToCart(selectedBike._id); setModalOpen(false); }}
              >Add to Cart</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      <div className="text-center mb-4">
        <h2 className="fw-bold display-5 text-primary mb-2">🏍️ Bike Marketplace</h2>
        <h5 className="text-secondary">Find your perfect ride from thousands of bikes</h5>
      </div>
      {/* User's Own Bikes Section */}
      {token && userProfile && (
        <div className="card border-0 shadow-lg mb-4" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px'
        }}>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="text-white fw-bold mb-2">
                  <i className="bi bi-shop me-2"></i>
                  Your Bikes Are Being Sold
                </h5>
                <p className="text-white-50 mb-0">
                  Your bikes are currently listed in the marketplace and visible to potential buyers. 
                  You can manage your listings from your profile page.
                </p>
              </div>
              <div className="col-md-4 text-end">
                <button 
                  className="btn btn-outline-light btn-lg"
                  onClick={() => navigate('/profile')}
                  style={{ borderRadius: '25px' }}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Manage My Bikes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="card card-body mb-4">
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-search text-secondary fs-4"></i>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search bikes by brand, model, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-outline-primary" onClick={() => setFilterOpen(!filterOpen)}>
            <i className="bi bi-funnel"></i> Filters
          </button>
        </div>
      </div>
      {/* Filter Panel */}
      {filterOpen && <FilterPanel />}
      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{filteredBikes.length} bikes found</h5>
        <span className="badge bg-primary bg-opacity-10 text-primary fs-6">{bikes.length} total bikes</span>
      </div>
      {/* Loading State */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Bikes Grid */}
          <div className="row g-4">
            {filteredBikes.map(bike => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={bike._id}>
                <BikeCard bike={bike} />
              </div>
            ))}
          </div>
          {/* No Results */}
          {filteredBikes.length === 0 && !loading && (
            <div className="text-center py-5">
              <i className="bi bi-bicycle text-secondary" style={{ fontSize: 80 }}></i>
              <h4 className="text-secondary mt-3">No bikes found</h4>
              <p className="text-secondary">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </>
      )}
      {/* Bike Details Modal */}
      {modalOpen && <BikeDetailsModal />}
      {/* Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show position-fixed bottom-0 end-0 m-4`} role="alert" style={{ zIndex: 9999 }}>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
        </div>
      )}
      {/* Floating Cart Button */}
      <button
        className="btn btn-primary position-fixed rounded-circle shadow-lg"
        style={{ bottom: 24, right: 24, width: 64, height: 64, zIndex: 1000 }}
        onClick={() => navigate('/cart')}
      >
        <i className="bi bi-cart fs-2"></i>
        {cartItems.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cartItems.length}
          </span>
        )}
      </button>
    </div>
  );
}

export default BikeMarketplace; 