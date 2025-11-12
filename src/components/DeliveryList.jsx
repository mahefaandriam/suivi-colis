import React, { useState } from 'react';
import DriverLogin from './DriverLogin';

const DeliveryList = ({ deliveries, selectedDelivery, onSelectDelivery, drivers, onDriverLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      assigned: 'status-assigned',
      picked_up: 'status-picked_up',
      in_transit: 'status-in_transit',
      delivered: 'status-delivered'
    };
    return colors[status] || 'status-pending';
  };

  return (
    <div className="delivery-list">
      <div className="list-header">
        <h2>Active Deliveries</h2>
        <button 
          className="driver-login-btn"
          onClick={() => setShowLogin(true)}
        >
          Driver Login
        </button>
      </div>

      {showLogin && (
        <DriverLogin
          drivers={drivers}
          onLogin={onDriverLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className={`delivery-item ${selectedDelivery?.id === delivery.id ? 'selected' : ''}`}
          onClick={() => onSelectDelivery(delivery)}
        >
          <div className="delivery-header">
            <span className="delivery-id">{delivery.id}</span>
            <span className={`delivery-status ${getStatusColor(delivery.status)}`}>
              {delivery.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="delivery-address">
            <strong>To:</strong> {delivery.destinationAddress}
          </div>
          
          <div className="delivery-info">
            <div>Recipient: {delivery.recipient}</div>
            <div>Package: {delivery.packageType}</div>
          </div>

          {delivery.driverId && (
            <div className="delivery-driver">
              Driver: {drivers.find(d => d.id === delivery.driverId)?.name || 'Unknown'}
            </div>
          )}
        </div>
      ))}

      {deliveries.length === 0 && (
        <div className="no-deliveries">
          <p>No active deliveries</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;