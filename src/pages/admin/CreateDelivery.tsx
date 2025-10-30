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
            console.error('Échec de la création de la livraison :', error);
        }
    };

    const handleChange = (section?: string, field?: string, value?: string) => {
        setFormData(prev => {
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
                    {/* En-tête */}
                    <div className="mb-8">
                        <Button variant="ghost" onClick={() => navigate('/admin/deliveries')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la liste des livraisons
                        </Button>
                        <h1 className="text-3xl font-bold">Créer une nouvelle livraison</h1>
                        <p className="text-muted-forground mt-2">
                            Entrez les détails de la livraison ci-dessous
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Informations de l’expéditeur */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package size={20} />
                                Informations sur l’expéditeur
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom de l’expéditeur *
                                    </label>
                                    <input
                                        type="text"
                                        id="senderName"
                                        required
                                        value={formData.sender.name}
                                        onChange={(e) => handleChange('sender', 'name', e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Entrez le nom complet de l’expéditeur"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse de l’expéditeur *
                                    </label>
                                    <textarea
                                        id="senderAddress"
                                        required
                                        rows={3}
                                        value={formData.sender.address}
                                        onChange={(e) => handleChange('sender', 'address', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Entrez l’adresse complète de l’expéditeur"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informations du destinataire */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations du destinataire</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du destinataire *
                                    </label>
                                    <input
                                        type="text"
                                        id="recipientName"
                                        required
                                        value={formData.recipient.name}
                                        onChange={(e) => handleChange('recipient', 'name', e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Entrez le nom complet du destinataire"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse du destinataire *
                                    </label>
                                    <textarea
                                        id="recipientAddress"
                                        required
                                        rows={3}
                                        value={formData.recipient.address}
                                        onChange={(e) => handleChange('recipient', 'address', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Entrez l’adresse complète du destinataire"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone du destinataire *
                                    </label>
                                    <input
                                        type="tel"
                                        id="recipientPhone"
                                        required
                                        value={formData.recipient.phone}
                                        onChange={(e) => handleChange('recipient', 'phone', e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Entrez le numéro de téléphone du destinataire"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informations sur le colis */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations sur le colis</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="packageWeight" className="block text-sm font-medium text-gray-700 mb-1">
                                        Poids (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        id="packageWeight"
                                        required
                                        step="0.1"
                                        min="0.1"
                                        value={formData.package.weight}
                                        onChange={(e) => handleChange('package', 'weight', e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
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
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="ex. : 10x10x5"
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
                                        placeholder="Décrivez le contenu du colis"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informations sur la livraison */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations sur la livraison</h2>
                            <div>
                                <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de livraison estimée *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="estimatedDelivery"
                                    required
                                    value={formData.estimatedDelivery}
                                    onChange={(e) => handleChange('', 'estimatedDelivery', e.target.value)}
                                    className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Boutons d’action */}
                        <div className="relative flex justify-end gap-3">
                            <Link
                                to="/admin/deliveries"
                                className="px-6 py-2 border rounded-md text-sm font-medium text-gray-300 bg-background hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Annuler
                            </Link>
                            <Button type="submit" variant="hero" size="lg" className="hero-cta" disabled={createDeliveryMutation.isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {createDeliveryMutation.isLoading ? 'Création en cours...' : 'Créer la livraison'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};
