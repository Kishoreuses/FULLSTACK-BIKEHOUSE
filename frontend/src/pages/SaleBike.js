import React, { useState } from 'react';
import axios from 'axios';

const brandOptions = [
  'Hero', 'Honda', 'Yamaha', 'Royal Enfield', 'Suzuki', 'Bajaj', 'TVS', 'KTM', 'Other'
];

function SaleBike() {
  const [form, setForm] = useState({
    brand: '',
    model: '',
    location: '',
    price: '',
    description: '',
    color: '',
    ownersCount: '',
    kilometresRun: '',
    modelYear: ''
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [rcFiles, setRcFiles] = useState([]);
  const [rcPreview, setRcPreview] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [insurancePreview, setInsurancePreview] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = e => {
    setImages([...e.target.files]);
    setPreview([...e.target.files].map(file => URL.createObjectURL(file)));
  };

  const handleRcChange = e => {
    setRcFiles([...e.target.files]);
    setRcPreview([...e.target.files].map(file => URL.createObjectURL(file)));
  };

  const handleInsuranceChange = e => {
    setInsuranceFiles([...e.target.files]);
    setInsurancePreview([...e.target.files].map(file => URL.createObjectURL(file)));
  };

  const validate = () => {
    const errs = {};
    if (!form.brand) errs.brand = 'Brand is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.price) {
      errs.price = 'Price is required';
    } else if (isNaN(form.price) || Number(form.price) <= 0) {
      errs.price = 'Price must be a positive number';
    }
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.color.trim()) errs.color = 'Color is required';
    if (!form.ownersCount) {
      errs.ownersCount = 'Number of owners is required';
    } else if (isNaN(form.ownersCount) || Number(form.ownersCount) < 1) {
      errs.ownersCount = 'Number of owners must be at least 1';
    }
    if (!form.kilometresRun) {
      errs.kilometresRun = 'Kilometres run is required';
    } else if (isNaN(form.kilometresRun) || Number(form.kilometresRun) < 0) {
      errs.kilometresRun = 'Kilometres run must be 0 or more';
    }
    if (!form.modelYear) {
      errs.modelYear = 'Model year is required';
    } else if (isNaN(form.modelYear) || Number(form.modelYear) < 1900) {
      errs.modelYear = 'Enter a valid model year';
    }
    if (images.length === 0) errs.images = 'At least one bike image is required';
    if (rcFiles.length === 0) errs.rc = 'At least one RC file is required';
    if (insuranceFiles.length === 0) errs.insurance = 'At least one insurance file is required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to post a bike.');
      setOpen(true);
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (["ownersCount", "kilometresRun", "modelYear", "price"].includes(k)) {
        if (v !== "" && !isNaN(v)) {
          data.append(k, Number(v));
        }
      } else if (k === "postedOn") {
        data.append("postedOn", new Date().toISOString());
      } else {
        if (v !== "") data.append(k, v);
      }
    });
    images.forEach(img => data.append('images', img));
    rcFiles.forEach(file => data.append('rc', file));
    insuranceFiles.forEach(file => data.append('insurance', file));
    try {
      await axios.post('http://localhost:5000/api/bikes', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Bike posted for sale!');
      setOpen(true);
      setForm({ brand: '', model: '', location: '', price: '', description: '', color: '', ownersCount: '', kilometresRun: '', modelYear: '' });
      setImages([]);
      setPreview([]);
      setRcFiles([]);
      setRcPreview([]);
      setInsuranceFiles([]);
      setInsurancePreview([]);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to post bike'
      );
      setOpen(true);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: `url('https://t3.ftcdn.net/jpg/12/57/98/50/360_F_1257985039_uWRawb8gzSHXshvOik689aEaJdj8FQfp.jpg`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
      }}
    >
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div
          className="card shadow-lg p-5 rounded-5 w-100 animate__animated animate__fadeIn"
          style={{
            maxWidth: 650,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2 className="fw-bold text-primary mb-4 text-center">Sell Your Bike</h2>
          <form noValidate onSubmit={handleSubmit} className="needs-validation" autoComplete="off">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="brand" className="form-label fs-5">Brand</label>
                <select
                  className={`form-select form-select-lg ${errors.brand ? 'is-invalid' : ''}`}
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Brand</option>
                  {brandOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="model" className="form-label fs-5">Model</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.model ? 'is-invalid' : ''}`}
                  id="model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  required
                />
                {errors.model && <div className="invalid-feedback">{errors.model}</div>}
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
              <div className="col-md-6">
                <label htmlFor="price" className="form-label fs-5">Price</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.price ? 'is-invalid' : ''}`}
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="1"
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="color" className="form-label fs-5">Color</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.color ? 'is-invalid' : ''}`}
                  id="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  required
                />
                {errors.color && <div className="invalid-feedback">{errors.color}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="ownersCount" className="form-label fs-5">Number of Owners</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.ownersCount ? 'is-invalid' : ''}`}
                  id="ownersCount"
                  name="ownersCount"
                  value={form.ownersCount}
                  onChange={handleChange}
                  required
                  min="1"
                />
                {errors.ownersCount && <div className="invalid-feedback">{errors.ownersCount}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="kilometresRun" className="form-label fs-5">Kilometres Run</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.kilometresRun ? 'is-invalid' : ''}`}
                  id="kilometresRun"
                  name="kilometresRun"
                  value={form.kilometresRun}
                  onChange={handleChange}
                  required
                  min="0"
                />
                {errors.kilometresRun && <div className="invalid-feedback">{errors.kilometresRun}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="modelYear" className="form-label fs-5">Model Year</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.modelYear ? 'is-invalid' : ''}`}
                  id="modelYear"
                  name="modelYear"
                  value={form.modelYear}
                  onChange={handleChange}
                  required
                  min="1900"
                />
                {errors.modelYear && <div className="invalid-feedback">{errors.modelYear}</div>}
              </div>
              <div className="col-12">
                <label htmlFor="description" className="form-label fs-5">Description</label>
                <textarea
                  className={`form-control form-control-lg ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
              <div className="col-12">
                <label className="form-label fs-5">Upload Your Bike Images</label>
                <input
                  type="file"
                  className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {errors.images && <div className="invalid-feedback">{errors.images}</div>}
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {preview.map((src, i) => (
                    <img key={i} src={src} alt="preview" width={80} className="rounded border" />
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label fs-5">Upload RC Files</label>
                <input
                  type="file"
                  className={`form-control ${errors.rc ? 'is-invalid' : ''}`}
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleRcChange}
                  required
                />
                {errors.rc && <div className="invalid-feedback">{errors.rc}</div>}
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {rcPreview.map((src, i) => (
                    <img key={i} src={src} alt="rc-preview" width={80} className="rounded border" />
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label fs-5">Upload Insurance Files</label>
                <input
                  type="file"
                  className={`form-control ${errors.insurance ? 'is-invalid' : ''}`}
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleInsuranceChange}
                  required
                />
                {errors.insurance && <div className="invalid-feedback">{errors.insurance}</div>}
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {insurancePreview.map((src, i) => (
                    <img key={i} src={src} alt="insurance-preview" width={80} className="rounded border" />
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100 mt-4">Post Bike</button>
          </form>
          {open && (
            <div className="alert alert-info alert-dismissible fade show mt-3" role="alert">
              {message}
              <button type="button" className="btn-close" onClick={() => setOpen(false)} aria-label="Close"></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaleBike;