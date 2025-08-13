import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SaleBike from './pages/SaleBike';
import BikeMarketplace from './pages/BikeMarketplace';
import Profile from './pages/Profile';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import BikeDetails from './pages/BikeDetails';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function isAdmin() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const user = JSON.parse(atob(token.split('.')[1]));
    return user.role === 'admin';
  } catch {
    return false;
  }
}

function SalesDetails() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/bikes', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSales(res.data.filter(b => b.sold));
      })
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">Not authorized. Admins only.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-primary mb-4">Sales Details</h2>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle bg-white shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Bike</th>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Date Posted</th>
                <th>Date Sold</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr><td colSpan={5} className="text-center">No sales found.</td></tr>
              )}
              {sales.map(bike => (
                <tr key={bike._id}>
                  <td><span className="fw-bold">{bike.brand} {bike.model}</span></td>
                  <td>{bike.owner?.username || 'N/A'}</td>
                  <td>{bike.buyer?.username || 'N/A'}</td>
                  <td>{bike.createdAt ? new Date(bike.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{bike.soldAt ? new Date(bike.soldAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserDetails() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [token, isAdmin]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeleting(userId);
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== userId));
      setMessage('User deleted successfully.');
    } catch (err) {
      setMessage('Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">Not authorized. Admins only.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold text-primary mb-4">User Details</h2>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" style={{ width: 60, height: 60 }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle bg-white shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center">No users found.</td></tr>
              )}
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.location || '-'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={deleting === u._id} onClick={() => handleDelete(u._id)}>
                      {deleting === u._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {message && (
        <div className="alert alert-info mt-3">{message}</div>
      )}
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  // const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  return (
      <Router>
        <Navbar />
        <Routes>
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/sale" element={<ProtectedRoute><SaleBike /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><BikeMarketplace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/bike/:id" element={<ProtectedRoute><BikeDetails /></ProtectedRoute>} />
        <Route path="/sales" element={<SalesDetails />} />
        <Route path="/users" element={<UserDetails />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </Router>
  );
}

export default App;