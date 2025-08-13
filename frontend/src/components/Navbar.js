import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (token && isMounted) {
        try {
          setLoading(true);
          const response = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (isMounted) {
            console.log('User profile data received:', response.data);
            setUserProfile(response.data);
            
            // Test image accessibility if profile image exists
            if (response.data.profileImage) {
              testImageUrl(response.data.profileImage).then(isAccessible => {
                console.log('Profile image accessible:', isAccessible);
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      console.log('Profile update event received in navbar');
      if (isMounted) {
        if (event.detail && event.detail.profileData) {
          console.log('Updating navbar with new profile data:', event.detail.profileData);
          setUserProfile(event.detail.profileData);
        } else {
          console.log('Fetching profile data from server');
          fetchUserProfile();
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [token]);

  const handleLogout = () => {
    try {
      // Clear all state first
      setUserProfile(null);
      setLoading(false);
      
      // Remove token
      localStorage.removeItem('token');
      
      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 0);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to simple redirect
      window.location.href = '/login';
    }
  };

  // Test function to check image accessibility
  const testImageUrl = async (imagePath) => {
    if (!imagePath) return false;
    try {
      const response = await fetch(`http://localhost:5000${imagePath}`);
      return response.ok;
    } catch (error) {
      console.error('Image test failed:', error);
      return false;
    }
  };

  let profileName = '';
  let originalUsername = '';
  const isAdmin = user && user.role === 'admin';
  
  if (userProfile) {
    profileName = isAdmin ? 'Admin' : userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.username || '';
    originalUsername = userProfile.username || '';
  } else if (user) {
    profileName = isAdmin ? 'Admin' : user.username || '';
    originalUsername = user.username || '';
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-lg animate__animated animate__fadeInDown"
      style={{
        fontFamily: 'Poppins, Roboto, Arial, sans-serif',
        minHeight: 70,
        borderBottom: '2px solid #1565c0',
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand d-flex align-items-center fw-bold fs-2"
          to={isAdmin ? "/admin" : "/"}
          style={{
            fontFamily: 'Poppins, Roboto, Arial, sans-serif',
            letterSpacing: 2,
            color: '#fff',
            fontWeight: 900,
            fontSize: '2.2rem',
            textShadow: '1px 2px 8px rgba(25, 118, 210, 0.2)'
          }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
            alt="BikeHouse Logo"
            style={{ width: 80, height: 80, marginRight: 10, borderRadius: 8, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)' }}
          />
          BIKEHOUSE
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            {isAdmin ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/admin">
                    <h4 className="mb-0 fw-bold">Dashboard</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/sales">
                    <h4 className="mb-0 fw-bold">Sales</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/users">
                    <h4 className="mb-0 fw-bold">User Details</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/about">
                    <h4 className="mb-0 fw-bold">About</h4>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/">
                    <h4 className="mb-0 fw-bold">Home</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/marketplace">
                    <h4 className="mb-0 fw-bold">Buy Bikes</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/sale">
                    <h4 className="mb-0 fw-bold">Sell Bike</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/cart">
                    <h4 className="mb-0 fw-bold">Cart</h4>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom px-3" to="/about">
                    <h4 className="mb-0 fw-bold">About</h4>
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
        {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-white text-primary fw-bold d-flex justify-content-center align-items-center shadow-sm overflow-hidden"
                    style={{ 
                      width: 44, 
                      height: 44, 
                      cursor: 'pointer', 
                      fontSize: 22, 
                      border: '2px solid #1976d2', 
                      fontFamily: 'Poppins, Roboto, Arial, sans-serif',
                      position: 'relative'
                    }}
                    onClick={() => navigate('/profile')}
                    key={userProfile?.profileImage || 'no-image'}
                  >
                    {userProfile && userProfile.profileImage ? (
                      <>
                        {console.log('Rendering profile image:', userProfile.profileImage)}
                        {console.log('Full image URL:', `http://localhost:5000${userProfile.profileImage}`)}
                        <img
                          src={`http://localhost:5000${userProfile.profileImage}?t=${Date.now()}`}
                          alt="Profile"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            console.log('Profile image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            console.log('Profile image loaded successfully:', e.target.src);
                          }}
                        />
                      </>
                    ) : (
                      console.log('No profile image available, showing initials')
                    )}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: userProfile && userProfile.profileImage ? 'none' : 'flex',
                        backgroundColor: '#fff',
                        color: '#1976d2',
                        fontSize: '22px',
                        fontWeight: 'bold'
                      }}
                    >
                      {(profileName && profileName.charAt(0).toUpperCase()) || 'U'}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-start justify-content-center" style={{ minWidth: 90 }}>
                    {loading ? (
                      <span className="fw-bold text-white fs-5" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
                        Loading...
                      </span>
                    ) : (
                      <>
                        <span className="fw-bold text-white fs-5" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
                          {profileName || 'User'}
                        </span>
                        {originalUsername && originalUsername !== profileName && (
                          <span className="text-white-50 small" style={{ fontSize: 14, marginTop: -4 }}>
                            @{originalUsername}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button className="btn btn-outline-light px-3 ms-2" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} onClick={handleLogout}>
                    <h4 className="mb-0 fw-bold">Logout</h4>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light px-3 me-2" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} to="/login">
                  <h4 className="mb-0 fw-bold">Login</h4>
                </Link>
                <Link className="btn btn-warning px-3" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }} to="/signup">
                  <h4 className="mb-0 fw-bold">Signup</h4>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .nav-link-custom {
          color: #fff !important;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-link-custom:hover, .nav-link-custom.active {
          background: #1565c0 !important;
          color: #fff !important;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;