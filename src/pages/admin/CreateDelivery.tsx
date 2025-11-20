// src/pages/CreateDelivery.tsx
import { useEffect, useState } from 'react';
import { useCreateDelivery } from '@/hooks/useDeliveries';
import { useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Save, UserRoundSearch, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { deliveryApi, driverApi } from '@/services/api';
import { User } from '@/types/auth';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import { useSocket } from '@/contexts/AdminSocketContext';

let DefaultIcon = L.divIcon({
    html: `<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map component for location selection
const LocationMap = ({ onLocationSelect, initialPosition }: {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPosition?: { lat: number; lng: number };
}) => {
    const [position, setPosition] = useState<[number, number] | null>(
        initialPosition ? [initialPosition.lat, initialPosition.lng] : null
    );

    const getRandomColor = () =>
        `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

    function LocationMarker() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                onLocationSelect(lat, lng);
            },
        });

        return position ? (
            <Marker
                position={position}
                icon={L.divIcon({
                    html: `<div style="background-color: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                })}
            />
        ) : null;
    }

    return (
        <div className="h-80 w-full rounded-lg overflow-hidden border">
            <MapContainer
                center={initialPosition ? [initialPosition.lat, initialPosition.lng] : [-18.8792, 47.5079]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
            </MapContainer>
        </div>
    );
};

export const CreateDelivery = () => {    
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const createDeliveryMutation = useCreateDelivery();
    const [activeDriver, setActiveDriver] = useState<User>(null);
    const [showMap, setShowMap] = useState(false);


    const [driverEmail, setDriverUserEmail] = useState(""); // use assigned to delivery must be checked
    const [driverEmailExists, setDriverEmailExists] = useState<boolean | null>(null);
    const [onCheckingDrvierEmail, setOncheckingDriverEmail] = useState(false);

    const [userEmail, setUserEmail] = useState(""); // use assigned to delivery must be checked
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [onCheckingEmail, setOncheckingEmail] = useState(false);

    const [creationError, setCreationError] = useState('');

    const [clientId, setClientId] = useState('');

    useEffect(() => {
        if (userEmail.length < 3) return; // don't check too early
        setEmailExists(null);
        setOncheckingEmail(true)
        const delay = setTimeout(() => {
            checkEmail(userEmail);
        }, 400); // debounce        

        return () => clearTimeout(delay);
    }, [userEmail]);


    useEffect(() => {
        if (driverEmail.length < 3) return; // don't check too early
        setDriverEmailExists(null);
        setOncheckingDriverEmail(true);
        const delay = setTimeout(() => {
            checkDriverEmail(driverEmail);
        }, 400); // debounce        

        return () => clearTimeout(delay);
    }, [driverEmail]);


    async function checkEmail(value: string) {
        try {
            const res = await deliveryApi.getUserIdByEmail(value);
            if (res.user.id) {
                setClientId(res.user.id);
                setEmailExists(true);
                formData.recipient.email = value;
            }
            // setEmailExists(data.exists);
            setOncheckingEmail(false);
        } catch {
            formData.recipient.email = null;
            setOncheckingEmail(false);
            setEmailExists(false);
        }
    }

    async function checkDriverEmail(value: string) {
        try {

            const driver = await driverApi.getDriverByEmail(value);
            if (driver.id) {
                setActiveDriver(driver);
                setDriverEmailExists(true);
                formData.colisDriver = value;
            }
            // setEmailExists(data.exists);
            setOncheckingDriverEmail(false);
        } catch {
            formData.colisDriver = null;
            setOncheckingDriverEmail(false);
            setDriverEmailExists(false);
        }
    }

    const getRandomColor = () =>
        `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

    const [formData, setFormData] = useState({
        sender: {
            name: '',
            address: ''
        },
        recipient: {
            name: '',
            address: '',
            phone: '',
            email: '',
            localisation: '-18.8792, 47.5079' // Default to Antananarivo
        },
        package: {
            weight: '',
            dimensions: '',
            description: ''
        },
        colisDriver: '',
        estimatedDelivery: '',
        colisTheme: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("email : ", emailExists, driverEmailExists, userEmail, driverEmailExists)
        setCreationError('')
        if (emailExists === true && driverEmailExists === true) {
            
            socket.emit('admin_assign_driver', {clientId: clientId, driverId: activeDriver.id})
            try {
                const deliveryData = {
                    sender: {
                        name: formData.sender.name,
                        address: formData.sender.address
                    },
                    recipient: {
                        name: formData.recipient.name,
                        address: formData.recipient.address,
                        phone: formData.recipient.phone,
                        email: formData.recipient.email,
                        localisation: formData.recipient.localisation,
                    },
                    package: {
                        weight: parseFloat(formData.package.weight),
                        dimensions: formData.package.dimensions,
                        description: formData.package.description
                    },
                    estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
                    driverEmail: formData.colisDriver,
                    driverId: activeDriver?.id || null,
                    colisTheme: getRandomColor(),
                };

                console.log("delivery : ", deliveryData)

                const result = await createDeliveryMutation.mutateAsync(deliveryData);
                setCreationError('');
                navigate(`/admin/deliveries/${result.id}`);
            } catch (error) {
                console.error('Échec de la création de la livraison :', error);
            }
        } else {
            setCreationError('Erreur veullez verfiez l\'email du livreur ou du destinataire')
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

    const handleLocationSelect = (lat: number, lng: number) => {
        const newLocalisation = `${lat}, ${lng}`;
        setFormData(prev => ({
            ...prev,
            recipient: {
                ...prev.recipient,
                localisation: newLocalisation
            }
        }));
    };

    const parseCurrentLocation = () => {
        try {
            const [lat, lng] = formData.recipient.localisation.split(',').map(coord => parseFloat(coord.trim()));
            return { lat, lng };
        } catch (error) {
            return { lat: -18.8792, lng: 47.5079 }; // Default to Antananarivo if parsing fails
        }
    };

    function findDriver(): void {
        const email = formData.colisDriver?.trim();
        if (!email) {
            window.alert('Veuillez entrer l\'email du livreur.');
            return;
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            window.alert('Veuillez entrer un email valide.');
            return;
        }

        (async () => {
            try {
                const driver = await driverApi.getDriverByEmail(email);
                setActiveDriver(driver);
            } catch (error) {
                console.error('Erreur lors de la recherche du livreur :', error);
                window.alert('Erreur lors de la recherche du livreur. Consultez la console pour plus de détails.');
            }
        })();
    }

    const currentLocation = parseCurrentLocation();

    
            

    function tassing(){
        console.log("emit assign", )
        socket.emit('admin_assign_driver', {clientId: '947b7411-d97e-467d-b2a9-5069f9e38fce', driverId: '4758f8a3-5426-4a42-b3c0-740133da28fb'})
    }

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
                    <button onClick={() => tassing()}>
                        try aasing
                    </button>
                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Informations de l'expéditeur */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package size={20} />
                                Informations sur l'expéditeur
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom de l'expéditeur *
                                    </label>
                                    <input
                                        type="text"
                                        id="senderName"
                                        required
                                        value={formData.sender.name}
                                        onChange={(e) => handleChange('sender', 'name', e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Entrez le nom complet de l'expéditeur"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse de l'expéditeur *
                                    </label>
                                    <textarea
                                        id="senderAddress"
                                        required
                                        rows={3}
                                        value={formData.sender.address}
                                        onChange={(e) => handleChange('sender', 'address', e.target.value)}
                                        className="w-full px-3 py-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md mb-4"
                                        placeholder="Entrez l'adresse complète de l'expéditeur"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informations du destinataire */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations du destinataire</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <div className='relative flex items-center justify-center'>
                                        <span className='absolute text-gray-400 right-3'>
                                            #
                                        </span>
                                        {emailExists === false && (<span className='absolute text-gray-400 text-sm border border-gray-700 rounded-xl right-8'>
                                            <Badge variant='destructive'>Non trouvé</Badge>
                                        </span>)}
                                        {emailExists === true && (<span className='absolute text-gray-400 text-sm border border-gray-700 rounded-xl right-8'>
                                            <Badge variant='success'>Trouvé</Badge>
                                        </span>)}
                                        {onCheckingEmail && <span className='absolute text-gray-400 text-sm  rounded-xl right-8'>
                                            <div className="flex items-center justify-center">
                                                <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                                            </div>
                                        </span>}

                                        <input
                                            type="text"
                                            id="recipientEmail"
                                            required
                                            value={userEmail}
                                            onChange={e => setUserEmail(e.target.value)}
                                            className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                            placeholder="Email du destinataire"
                                        />
                                    </div>
                                </div>
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
                                        placeholder="Entrez l'adresse complète du destinataire"
                                    />
                                </div>
                                {/* Localisation Map */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Localisation du destinataire *
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm text-gray-700">
                                                    <strong>Position sélectionnée:</strong> {formData.recipient.localisation}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowMap(!showMap)}
                                            >
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {showMap ? 'Masquer la carte' : 'Modifier la position'}
                                            </Button>
                                        </div>

                                        {showMap && (
                                            <div className="space-y-2">
                                                <LocationMap
                                                    onLocationSelect={handleLocationSelect}
                                                    initialPosition={currentLocation}
                                                />
                                                <p className="text-xs text-gray-500 text-center">
                                                    Cliquez sur la carte pour définir la position exacte du destinataire
                                                </p>
                                            </div>
                                        )}
                                    </div>
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

                        {/* Trouver un livreur */}
                        <div className="bg-card rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Information du livreur</h2>
                            <div>
                                <div className='relative flex items-center justify-center'>
                                    <span className='absolute text-gray-400 right-3'>
                                        #
                                    </span>
                                    {driverEmailExists === false && (<span className='absolute text-gray-400 text-sm border border-gray-700 rounded-xl right-8'>
                                        <Badge variant='destructive'>Non trouvé</Badge>
                                    </span>)}
                                    {driverEmailExists === true && (<span className='absolute text-gray-400 text-sm border border-gray-700 rounded-xl right-8'>
                                        <Badge variant='success'>Trouvé</Badge>
                                    </span>)}
                                    {onCheckingDrvierEmail && <span className='absolute text-gray-400 text-sm  rounded-xl right-8'>
                                        <div className="flex items-center justify-center">
                                            <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                                        </div>
                                    </span>}

                                    <input
                                        type="text"
                                        id="colisDriver"
                                        required
                                        value={driverEmail}
                                        onChange={e => setDriverUserEmail(e.target.value)}
                                        className="block w-full h-10 p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                        placeholder="Email du destinataire"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="relative flex justify-end gap-3">
                            <Link
                                to="/admin/deliveries"
                                className="px-6 py-2 border rounded-md text-sm font-medium text-gray-300 bg-background hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Annuler
                            </Link>
                            <Button type="submit" variant="hero" size="lg" className="hero-cta" disabled={createDeliveryMutation.isLoading} >
                                <Save className="mr-2 h-4 w-4" />
                                {createDeliveryMutation.isLoading ? 'Création en cours...' : 'Créer la livraison'}
                            </Button>

                        </div>
                        
                          <div className=' h-5 w-full text-red-500 text-right'>  {!createDeliveryMutation.isLoading && creationError}</div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}