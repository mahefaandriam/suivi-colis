// src/pages/CreateDelivery.tsx
import { useState } from 'react';
import { useCreateDelivery } from '@/hooks/useDeliveries';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const CreateDelivery = () => {
    const navigate = useNavigate();
    const createDeliveryMutation = useCreateDelivery();

    const [formData, setFormData] = useState({
        sender: {
            name: '',
            address: ''
        },
        recipient: {
            name: '',
            address: '',
            phone: ''
        },
        package: {
            weight: '',
            dimensions: '',
            description: ''
        },
        estimatedDelivery: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const deliveryData = {
                sender: {
                    name: formData.sender.name,
                    address: formData.sender.address
                },
                recipient: {
                    name: formData.recipient.name,
                    address: formData.recipient.address,
                    phone: formData.recipient.phone
                },
                package: {
                    weight: parseFloat(formData.package.weight),
                    dimensions: formData.package.dimensions,
                    description: formData.package.description
                },
                estimatedDelivery: new Date(formData.estimatedDelivery).toISOString()
            };

            const result = await createDeliveryMutation.mutateAsync(deliveryData);
            navigate(`/admin/deliveries/${result.id}`);
        } catch (error) {
            console.error('Failed to create delivery:', error);
        }
    };

    const handleChange = (section?: string, field?: string, value?: string) => {
        setFormData(prev => {
            // if no section provided (or empty), update top-level field
            if (!section || !field) {
                return {
                    ...prev,
                    [field as string]: value,
                };
            }

            return {
                ...prev,
                [section]: {
                    ...(prev as any)[section],
                    [field]: value,
                },
            };
        });
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-muted/30 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" onClick={() => navigate('/admin/deliveries')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Deliveries
                        </Button>
                        <h1 className="text-3xl font-bold">Create New Delivery</h1>
                        <p className="text-muted-forground mt-2">Enter the delivery details below</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Sender Information */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package size={20} />
                                Sender Information
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sender Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="senderName"
                                        required
                                        value={formData.sender.name}
                                        onChange={(e) => handleChange('sender', 'name', e.target.value)}
                                        className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        //  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Enter sender's full name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sender Address *
                                    </label>
                                    <textarea
                                        id="senderAddress"
                                        required
                                        rows={3}
                                        value={formData.sender.address}
                                        onChange={(e) => handleChange('sender', 'address', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Enter complete sender address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recipient Information */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Recipient Information</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Recipient Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="recipientName"
                                        required
                                        value={formData.recipient.name}
                                        onChange={(e) => handleChange('recipient', 'name', e.target.value)}
                                        className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Enter recipient's full name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Recipient Address *
                                    </label>
                                    <textarea
                                        id="recipientAddress"
                                        required
                                        rows={3}
                                        value={formData.recipient.address}
                                        onChange={(e) => handleChange('recipient', 'address', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Enter complete recipient address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Recipient Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        id="recipientPhone"
                                        required
                                        value={formData.recipient.phone}
                                        onChange={(e) => handleChange('recipient', 'phone', e.target.value)}
                                        className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Enter recipient's phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package Information */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Package Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="packageWeight" className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        id="packageWeight"
                                        required
                                        step="0.1"
                                        min="0.1"
                                        value={formData.package.weight}
                                        onChange={(e) => handleChange('package', 'weight', e.target.value)}
                                        className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="0.0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="packageDimensions" className="block text-sm font-medium text-gray-700 mb-1">
                                        Dimensions *
                                    </label>
                                    <input
                                        type="text"
                                        id="packageDimensions"
                                        required
                                        value={formData.package.dimensions}
                                        onChange={(e) => handleChange('package', 'dimensions', e.target.value)}
                                        className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="e.g., 10x10x5"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        id="packageDescription"
                                        required
                                        rows={3}
                                        value={formData.package.description}
                                        onChange={(e) => handleChange('package', 'description', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Describe the package contents"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
                            <div>
                                <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Delivery Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="estimatedDelivery"
                                    required
                                    value={formData.estimatedDelivery}
                                    onChange={(e) => handleChange('', 'estimatedDelivery', e.target.value)}
                                    className="block w-full h-10 px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="relative flex justify-end gap-3">
                            <Link
                                to="/admin/deliveries"
                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Cancel
                            </Link>
                            <Button type="submit"
                                disabled={createDeliveryMutation.isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {createDeliveryMutation.isLoading ? 'Creating...' : 'Create Delivery'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};