import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function BikeDetails() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]));
    } catch {}
  }

  useEffect(() => {
    axios.get(`http://localhost:5000/api/bikes/${id}`).then(res => setBike(res.data));
  }, [id]);

  const handleMarkAsSold = async () => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/bikes/${id}/sold`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBike(res.data);
      setMessage('Bike marked as sold!');
      setOpen(true);
    } catch (err) {
      setMessage('Failed to mark as sold');
      setOpen(true);
    }
  };

  if (!bike) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const canMarkAsSold =
    !bike.sold &&
    user &&
    (user.role === 'admin' || (bike.owner && bike.owner._id === user.id));

  return (
    <div className="container py-5 animate__animated animate__fadeIn" style={{ background: 'linear-gradient(135deg, #e3f0ff 0%, #b2bec3 100%)', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg p-4 mb-4 rounded-4">
            {bike.images && bike.images[0] && (
              <img src={bike.images[0]} alt={bike.model} className="card-img-top mb-3 rounded-4" style={{ height: 240, objectFit: 'cover' }} />
            )}
            <div className="card-body">
              <h2 className="fw-bold text-primary mb-2" style={{ fontSize: '2rem' }}>{bike.model}</h2>
              <p className="mb-1"><span className="fw-semibold">Location:</span> {bike.location}</p>
              <p className="mb-1"><span className="fw-semibold">Price:</span> ₹{bike.price}</p>
              <p className="mb-1"><span className="fw-semibold">Description:</span> {bike.description}</p>
              <p className="mb-1"><span className="fw-semibold">Owner:</span> {bike.owner?.username}</p>
              <p className="mb-1"><span className="fw-semibold">RC:</span> {bike.rc}</p>
              <p className="mb-1"><span className="fw-semibold">Insurance:</span> {bike.insurance}</p>
              <p className="mb-1"><span className="fw-semibold">Color:</span> {bike.color}</p>
              <p className="mb-1"><span className="fw-semibold">Number of Owners:</span> {bike.ownersCount}</p>
              <p className="mb-1"><span className="fw-semibold">Kilometres Run:</span> {bike.kilometresRun}</p>
              <p className="mb-1"><span className="fw-semibold">Model Year:</span> {bike.modelYear}</p>
              <p className="mb-1"><span className="fw-semibold">Posted On:</span> {bike.postedOn ? new Date(bike.postedOn).toLocaleString() : ''}</p>
              <p className={`fw-bold ${bike.sold ? 'text-danger' : 'text-success'}`}>
                {bike.sold ? `SOLD on ${bike.soldAt ? new Date(bike.soldAt).toLocaleDateString() : ''}` : 'Available'}
              </p>
              {canMarkAsSold && (
                <button className="btn btn-danger mt-2" onClick={handleMarkAsSold}>
                  Mark as Sold
                </button>
              )}
              <button className="btn btn-secondary mt-2 ms-2" onClick={() => window.history.back()}>Back</button>
            </div>
          </div>
          {open && (
            <div className="alert alert-info alert-dismissible fade show position-fixed bottom-0 end-0 m-4" role="alert" style={{ zIndex: 9999 }}>
              {message}
              <button type="button" className="btn-close" onClick={() => setOpen(false)}></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BikeDetails; 