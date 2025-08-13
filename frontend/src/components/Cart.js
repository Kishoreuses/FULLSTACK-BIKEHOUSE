import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CardMedia, Button, Grid, Snackbar, IconButton, Chip, Box, Divider } from '@mui/material';
import { Delete, ShoppingCart, LocalShipping, Payment, Favorite, Star, LocationOn, AttachMoney } from '@mui/icons-material';

function Cart() {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setMessage('Failed to load cart items');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (bikeId) => {
    try {
      await axios.delete('http://localhost:5000/api/users/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { bikeId }
      });
      setCart(cart.filter(bike => bike._id !== bikeId));
      setMessage('Item removed from cart successfully!');
      setOpen(true);
    } catch (error) {
      setMessage('Failed to remove item from cart');
      setOpen(true);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, bike) => total + bike.price, 0);
  };

  const handleCheckout = () => {
    setMessage('Checkout functionality coming soon!');
    setOpen(true);
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center text-white">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading your royal collection...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <Container maxWidth="lg">
        {/* Royal Header */}
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <ShoppingCart className="text-white me-3" style={{ fontSize: '3rem' }} />
            <h1 className="text-white fw-bold mb-0" style={{ fontSize: '3.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Royal Cart
            </h1>
          </div>
          <p className="text-white-50 fs-5 mb-0">Your premium collection awaits</p>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-5">
            <div className="card border-0 shadow-lg" style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px'
            }}>
              <div className="card-body p-5">
                <ShoppingCart className="text-muted mb-4" style={{ fontSize: '5rem' }} />
                <h3 className="fw-bold text-dark mb-3">Your Cart is Empty</h3>
                <p className="text-muted fs-5 mb-4">Discover our premium collection and add some royal rides to your cart</p>
                <Button 
                  variant="contained" 
                  size="large"
                  href="/bikes"
                  style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  Explore Premium Bikes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg mb-4" style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px'
              }}>
                <div className="card-header border-0 bg-transparent p-4">
                  <h4 className="fw-bold text-dark mb-0">
                    <ShoppingCart className="me-2" />
                    Your Collection ({cart.length} items)
                  </h4>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {cart.map((bike, index) => (
                      <div key={bike._id} className="col-12">
                        <div className="card border-0 shadow-sm h-100" style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          borderRadius: '15px',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="row g-0">
                            <div className="col-md-4">
                              <div className="position-relative h-100">
                                <img
                                  src={bike.images && bike.images[0] ? `http://localhost:5000${bike.images[0]}` : 'https://via.placeholder.com/400x300/667eea/ffffff?text=Premium+Bike'}
                                  alt={bike.model}
                                  className="w-100 h-100"
                                  style={{
                                    objectFit: 'cover',
                                    borderTopLeftRadius: '15px',
                                    borderBottomLeftRadius: '15px'
                                  }}
                                />
                                <div className="position-absolute top-0 start-0 m-3">
                                  <Chip
                                    label="Premium"
                                    size="small"
                                    style={{
                                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-md-8">
                              <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h5 className="fw-bold text-dark mb-2">{bike.brand} {bike.model}</h5>
                                    <div className="d-flex align-items-center mb-2">
                                      <LocationOn className="text-muted me-1" fontSize="small" />
                                      <span className="text-muted">{bike.location}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <Star className="text-warning me-1" fontSize="small" />
                                      <span className="text-muted">Premium Quality</span>
                                    </div>
                                  </div>
                                  <IconButton
                                    onClick={() => removeFromCart(bike._id)}
                                    style={{
                                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                                      color: 'white'
                                    }}
                                    size="small"
                                  >
                                    <Delete />
                                  </IconButton>
                                </div>
                                
                                <Divider className="my-3" />
                                
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="text-muted fs-6">Price</span>
                                    <div className="d-flex align-items-center">
                                      <AttachMoney className="text-success me-1" />
                                      <span className="fw-bold fs-4 text-success">₹{bike.price?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      style={{
                                        borderColor: '#667eea',
                                        color: '#667eea',
                                        borderRadius: '20px'
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                                <p className="mb-1"><span className="fw-semibold">No. of Owners:</span> {bike.ownersCount}</p>
                                <p className="mb-1"><span className="fw-semibold">Kilometres Run:</span> {bike.kilometresRun}</p>
                                <p className="mb-1"><span className="fw-semibold">Model Year:</span> {bike.modelYear}</p>
                                <p className="mb-1"><span className="fw-semibold">Posted On:</span> {bike.postedOn ? new Date(bike.postedOn).toLocaleString() : ''}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-lg" style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                position: 'sticky',
                top: '2rem'
              }}>
                <div className="card-header border-0 bg-transparent p-4">
                  <h5 className="fw-bold text-dark mb-0">
                    <Payment className="me-2" />
                    Order Summary
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal ({cart.length} items)</span>
                      <span className="fw-bold">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Processing Fee</span>
                      <span className="fw-bold">₹0</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Insurance</span>
                      <span className="fw-bold">₹0</span>
                    </div>
                    <Divider className="my-3" />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold fs-5">Total</span>
                      <span className="fw-bold fs-5 text-success">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCheckout}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      borderRadius: '25px',
                      padding: '15px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      marginBottom: '1rem'
                    }}
                  >
                    <Payment className="me-2" />
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    href="/bikes"
                    style={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderRadius: '25px',
                      padding: '15px',
                      fontSize: '1rem',
                      textTransform: 'none'
                    }}
                  >
                    <LocalShipping className="me-2" />
                    Continue Shopping
                  </Button>

                  <div className="mt-4 p-3" style={{
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '15px'
                  }}>
                    <h6 className="fw-bold text-dark mb-2">
                      <Favorite className="me-2 text-danger" />
                      Premium Benefits
                    </h6>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-1">
                        <small className="text-muted">✓ Free Premium Support</small>
                      </li>
                      <li className="mb-1">
                        <small className="text-muted">✓ Secure Payment</small>
                      </li>
                      <li className="mb-1">
                        <small className="text-muted">✓ Fast Delivery</small>
                      </li>
                      <li>
                        <small className="text-muted">✓ Quality Assurance</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Snackbar */}
        <Snackbar 
          open={open} 
          autoHideDuration={4000} 
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div className="alert alert-success d-flex align-items-center" role="alert" style={{
            background: 'linear-gradient(45deg, #28a745, #20c997)',
            color: 'white',
            borderRadius: '10px',
            border: 'none'
          }}>
            <span className="me-2">✓</span>
            {message}
          </div>
        </Snackbar>
      </Container>
    </div>
  );
}

export default Cart; 