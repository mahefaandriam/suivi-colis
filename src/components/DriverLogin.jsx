import React, { useState } from 'react';

const DriverLogin = ({ drivers, onLogin, onClose }) => {
  const [selectedDriver, setSelectedDriver] = useState('');

  const handleLogin = () => {
    if (selectedDriver) {
      onLogin(selectedDriver);
      onClose();
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-form">
        <h2>Driver Login</h2>
        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
        >
          <option value="">Select Driver</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name} - {driver.vehicle}
            </option>
          ))}
        </select>
        <button onClick={handleLogin} disabled={!selectedDriver}>
          Login as Driver
        </button>
        <button 
          onClick={onClose}
          style={{ marginTop: '0.5rem', background: '#95a5a6' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DriverLogin;