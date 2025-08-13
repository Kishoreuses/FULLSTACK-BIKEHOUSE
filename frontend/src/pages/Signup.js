import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const backgroundImage =
  'https://t4.ftcdn.net/jpg/08/63/30/05/360_F_863300589_NojEYK8ktAoHEbIQEpTv8VUFAlMR49xx.jpg';

function Signup() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '',
    phone: '', location: '', address: ''
  });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.username.trim()) {
      errs.username = 'Username is required';
    } else if (form.username.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = 'Phone number must be 10 digits';
    }
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    return errs;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const response = await axios.post('http://localhost:5000/api/users/signup', form);
      setMessage('Signup successful! Redirecting...');
      setOpen(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
      setOpen(true);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)'
        }}
      />
      <div className="container d-flex align-items-center justify-content-center min-vh-100 animate__animated animate__fadeIn">
        <div className="card shadow-lg p-5 rounded-5 w-100" style={{ maxWidth: 600, background: 'linear-gradient(135deg, #e3f0ff 0%, #f8faff 100%)' }}>
          <div className="text-center mb-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
              alt="BikeHouse Logo"
              width={120}
              height={90}
              style={{ marginBottom: 16 }}
            />
            <h2 className="fw-bold text-primary mb-1">Create Your Account</h2>
            <h5 className="text-secondary mb-0">Join BikeHouse and start your journey!</h5>
          </div>
          <form noValidate onSubmit={handleSubmit} className="needs-validation" autoComplete="off">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label fs-5">First Name</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label fs-5">Last Name</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="username" className="form-label fs-5">Username</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label fs-5">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="9876543210"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="password" className="form-label fs-5">Password</label>
                <input
                  type="password"
                  className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="location" className="form-label fs-5">Location</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.location ? 'is-invalid' : ''}`}
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
                {errors.location && <div className="invalid-feedback">{errors.location}</div>}
              </div>
              <div className="col-12">
                <label htmlFor="address" className="form-label fs-5">Address</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.address ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100 mt-4">Sign Up</button>
          </form>
          <div className="mt-4 text-center">
            <span className="fs-6">Already have an account?{' '}</span>
            <Link to="/login" className="fw-bold text-primary text-decoration-none fs-6">Login</Link>
          </div>
          {open && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              {message}
              <button type="button" className="btn-close" onClick={() => setOpen(false)} aria-label="Close"></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Signup;