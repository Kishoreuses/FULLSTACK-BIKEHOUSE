import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const backgroundImage =
  'https://t4.ftcdn.net/jpg/08/63/30/05/360_F_863300589_NojEYK8ktAoHEbIQEpTv8VUFAlMR49xx.jpg';

function Login() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.usernameOrEmail.trim()) {
      errs.usernameOrEmail = 'Username or Email is required';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      localStorage.setItem('token', res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
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
        <div className="card shadow-lg p-5 rounded-5 w-100" style={{ maxWidth: 520, background: 'linear-gradient(135deg, #e3f0ff 0%, #f8faff 100%)' }}>
          <div className="text-center mb-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPaKlSW5mpdJ1VdekmO9xedXM_TmkuO6tbwGeilzMzShKE6T_6sp7MtY6gUcNelgHWHxQ&usqp=CAU"
              alt="BikeHouse Logo"
              width={120}
              height={90}
              style={{ marginBottom: 12 }}
            />
            <h2 className="fw-bold text-primary mb-1">Welcome Back</h2>
            <h5 className="text-secondary mb-0">Login to BikeHouse</h5>
          </div>
          <form noValidate onSubmit={handleSubmit} className="needs-validation" autoComplete="off">
            <div className="mb-3">
              <label htmlFor="usernameOrEmail" className="form-label fs-5">Username or Email</label>
              <input
                type="text"
                className={`form-control form-control-lg ${errors.usernameOrEmail ? 'is-invalid' : ''}`}
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                required
                autoFocus
              />
              {errors.usernameOrEmail && <div className="invalid-feedback">{errors.usernameOrEmail}</div>}
            </div>
            <div className="mb-3">
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
            <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">Login</button>
          </form>
          <div className="mt-4 text-center">
            <span className="fs-6">Don't have an account?{' '}</span>
            <Link to="/signup" className="fw-bold text-primary text-decoration-none fs-6">Sign Up</Link>
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

export default Login;