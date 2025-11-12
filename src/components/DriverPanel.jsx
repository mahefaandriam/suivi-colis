import React from 'react';

const DriverPanel = ({ driver, deliveries, onStartDelivery }) => {
  const assignedDeliveries = deliveries.filter(d => d.status === 'assigned');
  const activeDeliveries = deliveries.filter(d => d.status === 'picked_up' || d.status === 'in_transit');

  return (
    <div className="driver-panel">
      <div className="driver-info">
        <h2>{driver?.name}</h2>
        <p>Vehicle: {driver?.vehicle}</p>
        <p>Status: <span style={{color: '#2ecc71'}}>Online</span></p>
      </div>

      <div className="driver-assignments">
        <h3>New Assignments ({assignedDeliveries.length})</h3>
        {assignedDeliveries.map(delivery => (
          <div key={delivery.id} className="assignment-item">
            <div className="assignment-header">
              <strong>{delivery.id}</strong>
            </div>
            <div className="assignment-details">
              <p>To: {delivery.destinationAddress}</p>
              <p>Recipient: {delivery.recipient}</p>
            </div>
            <div className="assignment-actions">
              <button onClick={() => onStartDelivery(delivery.id)}>
                Start Delivery
              </button>
            </div>
          </div>
        ))}

        <h3>Active Deliveries ({activeDeliveries.length})</h3>
        {activeDeliveries.map(delivery => (
          <div key={delivery.id} className="assignment-item">
            <div className="assignment-header">
              <strong>{delivery.id}</strong>
              <span className={`delivery-status status-${delivery.status}`}>
                {delivery.status.replace('_', ' ')}
              </span>
            </div>
            <div className="assignment-details">
              <p>To: {delivery.destinationAddress}</p>
              <p>Recipient: {delivery.recipient}</p>
            </div>
          </div>
        ))}

        {deliveries.length === 0 && (
          <div className="no-assignments">
            <p>No assignments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPanel;