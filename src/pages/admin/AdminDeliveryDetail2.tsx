// Update src/pages/DeliveryDetails.tsx
import { useParams, Link } from 'react-router-dom';
import { useDelivery, useUpdateDeliveryStatus } from '@/hooks/useDeliveries';
import { StatusBadge } from '@/components/StatusBadge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { formatDate, getStatusConfig } from '@/utils/statusUtils';
import { 
  MapPin, 
  Calendar, 
  Package, 
  User, 
  Phone,
  ArrowLeft,
  Truck,
  QrCode
} from 'lucide-react';
import { useState } from 'react';

export const DeliveryDetails2 = () => {
  const { id } = useParams<{ id: string }>();
  const { data: delivery, isLoading } = useDelivery(id!);
  const updateStatusMutation = useUpdateDeliveryStatus();
  
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    location: '',
    description: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Delivery not found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (updateData.status && updateData.location && updateData.description) {
      await updateStatusMutation.mutateAsync({
        id: delivery.id,
        updateData: {
          status: updateData.status as any,
          location: updateData.location,
          description: updateData.description
        }
      });
      setShowStatusUpdate(false);
      setUpdateData({ status: '', location: '', description: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/deliveries"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Deliveries
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {delivery.trackingNumber}
              </h1>
              <p className="text-gray-600 mt-1">{delivery.package.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={delivery.status} />
              <button
                onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Truck size={16} className="mr-2" />
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        {showStatusUpdate && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4">Update Delivery Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Status</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
              
              <input
                type="text"
                placeholder="Location"
                value={updateData.location}
                onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <textarea
              placeholder="Description"
              value={updateData.description}
              onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {delivery.timeline.map((event, index) => {
                    const config = getStatusConfig(event.status);
                    const Icon = config.icon;
                    
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`} />
                          {index < delivery.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={16} />
                            <span className="font-medium text-gray-900">{config.label}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{event.description}</p>
                          <p className="text-gray-500 text-sm mt-1">{event.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <QRCodeGenerator delivery={delivery} />

            {/* Package Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Package Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Description</p>
                    <p className="text-sm text-gray-600">{delivery.package.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weight</p>
                    <p className="text-sm text-gray-600">{delivery.package.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dimensions</p>
                    <p className="text-sm text-gray-600">{delivery.package.dimensions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(delivery.estimatedDelivery)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sender & Recipient */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Sender & Recipient</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Sender
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{delivery.sender.name}</p>
                    <p className="text-gray-600">{delivery.sender.address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Recipient
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{delivery.recipient.name}</p>
                    <p className="text-gray-600">{delivery.recipient.address}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone size={14} />
                      {delivery.recipient.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails2;