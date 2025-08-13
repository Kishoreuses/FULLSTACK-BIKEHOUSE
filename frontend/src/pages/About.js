import React from 'react';

const bikeImages = [
  'https://wallpapers.com/images/hd/bike-background-n3lcqq8hkgc12ivw.jpg',
  'https://i.pinimg.com/736x/e6/ec/a9/e6eca9e180b4d7d9767558a63843e20c.jpg',
  'https://www.godigit.com/content/dam/godigit/directportal/en/motorcycle.jpg',
];

const companyMembers = [
  {
    name: 'KISHORE S',
    role: 'Founder & CEO',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    info: 'Visionary leader with 10+ years in the bike industry. Passionate about connecting riders and sellers.'
  },
  {
    name: 'SANJAY V S',
    role: 'Operations Head',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    info: 'Ensures smooth transactions and customer satisfaction. Loves long rides and classic bikes.'
  },
  {
    name: 'ANANDAKUMAR K J',
    role: 'Lead Developer',
    photo: 'https://randomuser.me/api/portraits/men/65.jpg',
    info: 'Tech enthusiast building secure and user-friendly experiences for BikeHouse.'
  },
  {
    name: 'Admin Team',
    role: 'Support & Verification',
    photo: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    info: 'Dedicated team for platform safety, verification, and support.'
  },
];

function About() {
  return (
    <div className="container py-5 animate__animated animate__fadeIn" style={{ background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', minHeight: '100vh', color: '#fff' }}>
      <div className="card shadow-lg p-5 mb-4 rounded-4" style={{ background: 'rgba(44,62,80,0.93)' }}>
        <h2 className="fw-bold display-4 mb-3 text-center" style={{ color: '#64b5f6', letterSpacing: 2 }}>About BIKEHOUSE</h2>
        <hr className="mb-4" style={{ borderTop: '2px solid #64b5f6', width: '60%', margin: '0 auto' }} />
        <div className="mb-4">
          <h4 className="fw-semibold mb-2 text-center" style={{ color: '#e3f0ff' }}>
            BIKEHOUSE is India's most trusted platform for buying and selling second-hand bikes. We connect passionate riders and sellers, offering a seamless, secure, and transparent experience.
          </h4>
          <p className="fs-5 mb-2 text-center" style={{ color: '#e3f0ff' }}>
            Our platform offers advanced search, secure transactions, and a dedicated admin team to keep everything running smoothly. Whether you want to upgrade your ride or find a great deal, BIKEHOUSE is the place for you!
          </p>
        </div>
        <div className="row g-4 mb-4 justify-content-center align-items-center">
          {bikeImages.map((img, idx) => (
            <div className="col-12 col-sm-4" key={idx}>
              <div className="card h-100 shadow-lg rounded-4" style={{ background: 'rgba(44,62,80,0.93)', color: '#fff' }}>
                <img src={img} alt={`Bike ${idx + 1}`} className="card-img-top" style={{ height: 180, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <div className="card-body text-center">
                  <h5 className="fw-bold">{idx === 0 ? 'Premium Bikes' : idx === 1 ? 'Adventure Rides' : 'Urban Classics'}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-4 text-center">
          <h3 className="fw-bold mb-2" style={{ color: '#64b5f6' }}>Contact & Company Details</h3>
          <p className="fs-5 mb-1 text-white">Email: <span style={{ color: '#64b5f6' }}>support@bikehouse.com</span></p>
          <p className="fs-5 mb-1 text-white">Phone: <span style={{ color: '#64b5f6' }}>+91-9677871881</span></p>
          <p className="fs-5 mb-1 text-white">Admin Contact: <span style={{ color: '#64b5f6' }}>kishoreuses@gmail.com</span></p>
          <p className="fs-5 mb-1 text-white">Address: <span style={{ color: '#64b5f6' }}>BikeHouse HQ, TamilNadu, India</span></p>
        </div>
        <div className="mb-2">
          <h3 className="fw-bold mb-3 text-center" style={{ color: '#64b5f6' }}>Meet Our Team</h3>
          <div className="row g-4 justify-content-center">
            {companyMembers.map((member, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={idx}>
                <div className="card h-100 shadow-lg rounded-4 text-center p-2" style={{ background: 'rgba(52,73,94,0.95)', color: '#fff' }}>
                  <div className="d-flex justify-content-center mb-2">
                    <img src={member.photo} alt={member.name} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #64b5f6', background: '#fff' }} />
                  </div>
                  <div className="card-body">
                    <h5 className="fw-bold" style={{ color: '#64b5f6' }}>{member.name}</h5>
                    <p className="fw-semibold mb-1">{member.role}</p>
                    <p className="mb-0" style={{ color: '#e3f0ff' }}>{member.info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;