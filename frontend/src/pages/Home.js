import React, { useEffect, useState } from 'react';
import axios from 'axios';

const carouselImages = [
  {
    src: 'https://wallpapers.com/images/hd/bike-background-n3lcqq8hkgc12ivw.jpg',
    caption: 'Find Your Dream Bike',
  },
  {
    src: 'https://www.beepkart.com/images/Buy-new-banner-19-june-mob.webp',
    caption: 'Best Deals, Trusted Sellers',
  },
  {
    src: 'https://www.godigit.com/content/dam/godigit/directportal/en/motorcycle.jpg',
    caption: 'Buy & Sell Bikes Easily',
  },
  {
    src: 'https://i.pinimg.com/736x/e6/ec/a9/e6eca9e180b4d7d9767558a63843e20c.jpg',
    caption: 'Ride with Confidence',
  },
];

const testimonials = [
  {
    name: 'KISHORE S',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'BikeHouse made selling my bike super easy and quick. Highly recommended!',
  },
  {
    name: 'SANJAY V S',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'I found my dream bike at a great price. The process was smooth and safe.',
  },
  {
    name: 'THIYANESH S',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    text: 'Excellent platform with verified sellers. I felt confident buying here.',
  },
];

const partners = [
  { name: 'Hero', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Hero_MotoCorp.svg/1200px-Hero_MotoCorp.svg.png' },
  { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { name: 'Yamaha', logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQFn5nXc5RQGzg/company-logo_200_200/company-logo_200_200/0/1739344299214/yamaha_motor_company_logo?e=2147483647&v=beta&t=CXm6g9nyqmUNJ3x98tz3PW5BduK3d8v7JMudjmplBxU' },
  { name: 'Royal Enfield', logo: 'https://images.seeklogo.com/logo-png/36/1/royal-enfield-logo-png_seeklogo-361484.png' },
];

function Home() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState({ location: '', model: '' });
  const [price, setPrice] = useState([0, 100000]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/bikes')
      .then(res => setBikes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({ ...search, minPrice: price[0], maxPrice: price[1] }).toString();
    const res = await axios.get(`http://localhost:5000/api/bikes?${params}`);
    setBikes(res.data);
    setLoading(false);
  };

  const featuredBikes = [...bikes].sort((a, b) => b.price - a.price).slice(0, 3);

  return (
    <div className="bg-light" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div className="container-fluid py-5 animate__animated animate__fadeIn">
        <div className="row justify-content-center align-items-center mb-5">
          <div className="col-lg-10">
            <div className="position-relative rounded-4 overflow-hidden shadow-lg" style={{ height: 420, background: '#1a1a1a' }}>
              <div id="homeCarousel" className="carousel slide h-100" data-bs-ride="carousel">
                <div className="carousel-inner h-100">
                  {carouselImages.map((item, idx) => (
                    <div className={`carousel-item h-100${idx === 0 ? ' active' : ''}`} key={idx}>
                      <img src={item.src} className="d-block w-100 h-100" alt={item.caption} style={{ objectFit: 'cover', filter: 'brightness(0.6)' }} />
                      <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
                        <h1 className="display-2 fw-bold text-white text-shadow mb-3" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>{item.caption}</h1>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
              <button
                className="btn btn-warning btn-lg position-absolute bottom-0 start-50 translate-middle-x mb-4 px-5 py-3 fw-bold shadow-lg"
                style={{ fontSize: 28, borderRadius: 16, fontFamily: 'Poppins, Roboto, Arial, sans-serif', background: 'linear-gradient(45deg, #ff6b35, #f7931e)' }}
                onClick={() => window.location.href = '/sale'}
              >
                <i className="bi bi-bicycle me-2"></i>
                Sell Your Bike
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section - Full Width */}
      <div className="container-fluid mb-5">
        <div className="card shadow-lg p-5 mb-4 rounded-4" style={{ margin: '0 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h2 className="fw-bold display-5 mb-3 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
            <i className="bi bi-info-circle me-3"></i>
            About BikeHouse
          </h2>
          <hr className="mb-4" style={{ borderTop: '2px solid #fff', width: '60%', margin: '0 auto' }} />
          <h4 className="fw-semibold mb-2 text-center">BikeHouse is India's most trusted platform for buying and selling bikes. We connect passionate riders and sellers, offering a seamless, secure, and transparent experience. Whether you're looking for your first bike or upgrading to your dream ride, BikeHouse is your one-stop destination.</h4>
          <div className="row mt-4 text-center">
            <div className="col-md-4">
              <i className="bi bi-graph-up-arrow text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold fs-3 mt-2">100K+ Bikes Sold</h5>
            </div>
            <div className="col-md-4">
              <i className="bi bi-people-fill text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold fs-3 mt-2">50K+ Happy Users</h5>
            </div>
            <div className="col-md-4">
              <i className="bi bi-shield-check text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold fs-3 mt-2">Verified Dealers</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="container mb-5">
        <div className="card shadow-lg p-4 mb-4 rounded-4" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
          <h3 className="text-center mb-4">
            <i className="bi bi-search me-2"></i>
            Find Your Perfect Bike
          </h3>
          <form className="row g-3 align-items-end" onSubmit={handleSearch}>
            <div className="col-md-4">
              <label className="form-label fs-5">
                <i className="bi bi-geo-alt me-2"></i>
                Location
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="location"
                value={search.location}
                onChange={e => setSearch({ ...search, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fs-5">
                <i className="bi bi-bicycle me-2"></i>
                Model
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="model"
                value={search.model}
                onChange={e => setSearch({ ...search, model: e.target.value })}
                placeholder="Enter model"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-5">
                <i className="bi bi-currency-rupee me-2"></i>
                Price Range
              </label>
              <div className="d-flex align-items-center gap-2">
                <input type="number" className="form-control" min="0" max="100000" value={price[0]} onChange={e => setPrice([+e.target.value, price[1]])} />
                <span className="mx-2">to</span>
                <input type="number" className="form-control" min="0" max="100000" value={price[1]} onChange={e => setPrice([price[0], +e.target.value])} />
              </div>
            </div>
            <div className="col-md-1 d-grid">
              <button type="submit" className="btn btn-primary btn-lg fw-bold mt-2" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Featured Bikes Section */}
      <div className="container mb-5">
        <h2 className="fw-bold display-6 text-white mb-4 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
          <i className="bi bi-star-fill text-warning me-3"></i>
          Featured Bikes
        </h2>
        <div className="row g-4 justify-content-center">
          {featuredBikes.map(bike => (
            <div className="col-12 col-md-4" key={bike._id}>
              <div className="card h-100 shadow-lg rounded-4" style={{ cursor: 'pointer', transition: 'transform 0.3s ease', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white' }} 
                   onClick={() => window.location.href = `/bike/${bike._id}`}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {bike.images && bike.images[0] && (
                  <img src={`http://localhost:5000${bike.images[0]}`} alt={bike.model} className="card-img-top" style={{ height: 220, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                )}
                <div className="card-body">
                  <h4 className="fw-bold mb-2" style={{ fontSize: 28 }}>{bike.brand} {bike.model}</h4>
                  <p className="mb-1">
                    <i className="bi bi-geo-alt me-2"></i>
                    Location: <span className="fw-semibold">{bike.location}</span>
                  </p>
                  <p className="mb-1 text-warning fw-bold">
                    <i className="bi bi-currency-rupee me-2"></i>
                    Price: ₹{bike.price?.toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-people me-2"></i>
                    Owners: <span className="fw-semibold">{bike.ownersCount}</span>
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-speedometer2 me-2"></i>
                    KMs: <span className="fw-semibold">{bike.kilometresRun}</span>
                  </p>
                  <p className="mb-1">
                    <i className="bi bi-calendar me-2"></i>
                    Year: <span className="fw-semibold">{bike.modelYear}</span>
                  </p>
                  <p className="mb-0 text-light">{bike.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mb-5">
        <h2 className="fw-bold display-6 text-white mb-4 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
          <i className="bi bi-gear-wide-connected me-3"></i>
          How It Works
        </h2>
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-lg rounded-4 text-center p-4" style={{ transition: 'transform 0.3s ease', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <i className="bi bi-person-plus text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold fs-3 mt-3">Sign Up</h5>
              <p className="text-light">Create your account in seconds and join our bike community.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-lg rounded-4 text-center p-4" style={{ transition: 'transform 0.3s ease', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <i className="bi bi-search text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold fs-3 mt-3">Browse & Search</h5>
              <p className="text-light">Find the perfect bike or list yours for sale with ease.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-lg rounded-4 text-center p-4" style={{ transition: 'transform 0.3s ease', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <i className="bi bi-handshake text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold fs-3 mt-3">Connect & Ride</h5>
              <p className="text-light">Connect with verified sellers and buyers. Enjoy your ride!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mb-5">
        <h2 className="fw-bold display-6 text-white mb-4 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
          <i className="bi bi-chat-quote-fill me-3"></i>
          What Our Users Say
        </h2>
        <div className="row g-4 justify-content-center">
          {testimonials.map((t, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="card h-100 shadow-lg rounded-4 p-4 text-center" style={{ transition: 'transform 0.3s ease', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <img src={t.avatar} alt={t.name} className="rounded-circle mb-3" style={{ width: 72, height: 72, objectFit: 'cover', border: '3px solid #667eea' }} />
                <h5 className="fw-bold mb-2" style={{ fontSize: 24 }}>{t.name}</h5>
                <p className="fs-5">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Bikes Section */}
      <div className="container mb-5">
        <h2 className="fw-bold display-6 text-white mb-4 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
          <i className="bi bi-bicycle me-3"></i>
          All Bikes
        </h2>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-warning" style={{ width: 60, height: 60 }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {bikes.map(bike => (
              <div className="col-12 col-md-4" key={bike._id}>
                <div className="card h-100 shadow-lg rounded-4" style={{ cursor: 'pointer', transition: 'transform 0.3s ease', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white' }} 
                     onClick={() => window.location.href = `/bike/${bike._id}`}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  {bike.images && bike.images[0] && (
                    <img src={`http://localhost:5000${bike.images[0]}`} alt={bike.model} className="card-img-top" style={{ height: 200, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                  )}
                  <div className="card-body">
                    <h4 className="fw-bold mb-2" style={{ fontSize: 24 }}>{bike.brand} {bike.model}</h4>
                    <p className="mb-1">
                      <i className="bi bi-geo-alt me-2"></i>
                      Location: <span className="fw-semibold">{bike.location}</span>
                    </p>
                    <p className="mb-1 text-warning fw-bold">
                      <i className="bi bi-currency-rupee me-2"></i>
                      Price: ₹{bike.price?.toLocaleString()}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-people me-2"></i>
                      No. of Owners: <span className="fw-semibold">{bike.ownersCount}</span>
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Kilometres Run: <span className="fw-semibold">{bike.kilometresRun}</span>
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-calendar me-2"></i>
                      Model Year: <span className="fw-semibold">{bike.modelYear}</span>
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-clock me-2"></i>
                      Posted On: <span className="fw-semibold">{bike.postedOn ? new Date(bike.postedOn).toLocaleString() : ''}</span>
                    </p>
                    <p className="mb-0 text-light">{bike.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Info Section */}
      <div className="container mb-5">
        <div className="card shadow-lg p-5 mb-4 rounded-4 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h2 className="fw-bold display-6 mb-3" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
            <i className="bi bi-question-circle me-3"></i>
            Why Choose BikeHouse?
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <i className="bi bi-shield-check text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold mt-2">Verified Sellers</h5>
              <p className="text-light">All sellers are verified for trust and safety.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-currency-exchange text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold mt-2">Best Prices</h5>
              <p className="text-light">Get the best deals on new and used bikes.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-lightning text-warning" style={{ fontSize: '4rem' }}></i>
              <h5 className="fw-bold mt-2">Easy Process</h5>
              <p className="text-light">Buy or sell your bike in just a few clicks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Download Section */}
      <div className="container mb-5">
        <div className="card shadow-lg p-5 mb-4 rounded-4 text-center" style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white' }}>
          <h2 className="fw-bold display-6 mb-3">
            <i className="bi bi-phone me-3"></i>
            Get the BikeHouse App!
          </h2>
          <h4 className="mb-3">Buy, sell, and manage your bikes on the go. Download now:</h4>
          <div className="d-flex justify-content-center gap-3 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: 56, cursor: 'pointer' }} />
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" style={{ height: 56, cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {/* Partners/Sponsors Section */}
      <div className="container mb-5">
        <h2 className="fw-bold display-6 text-white mb-4 text-center" style={{ letterSpacing: 2, fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
          <i className="bi bi-handshake me-3"></i>
          Our Partners
        </h2>
        <div className="row g-4 justify-content-center align-items-center">
          {partners.map((p, idx) => (
            <div className="col-6 col-md-3" key={idx}>
              <div className="card h-100 shadow-lg rounded-4 text-center p-3" style={{ transition: 'transform 0.3s ease', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <img src={p.logo} alt={p.name} style={{ height: 56, marginBottom: 12 }} />
                <h5 className="fw-bold">{p.name}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section - Full Width */}
      <div className="container-fluid mb-5">
        <div className="card shadow-lg p-5 mb-4 rounded-4 text-center" style={{ margin: '0 20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
          <h2 className="fw-bold display-6 text-primary mb-3">
            <i className="bi bi-envelope me-3"></i>
            Contact Us
          </h2>
          <h4 className="mb-3">Have questions or need help? Reach out to our support team!</h4>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <p className="fs-5 text-primary">
                <i className="bi bi-envelope me-2"></i>
                Email: support@bikehouse.com
              </p>
            </div>
            <div className="col-md-6">
              <p className="fs-5 text-primary">
                <i className="bi bi-telephone me-2"></i>
                Phone: +91-9876543210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;