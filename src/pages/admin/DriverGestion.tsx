// src/pages/Register.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Package,
    CheckCircle,
    XCircle,
    ArrowLeft,
    X,
    Download,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2
} from 'lucide-react';
import { RegisterData } from '@/types/auth';
import { Button } from '@/components/ui/button';

interface PasswordValidation {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}
const Register = ({ onClose }) => {
    const [formData, setFormData] = useState<RegisterData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        created_by: ''
    });
    const { user } = useAuth();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false,
        role: false,
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    // Validation du mot de passe
    const passwordValidation: PasswordValidation = {
        hasMinLength: formData.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    };

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    const passwordsMatch = formData.password === confirmPassword;

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleChange = (field: keyof RegisterData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const getFieldError = (field: keyof RegisterData): string => {
        if (!touched[field]) return '';

        switch (field) {
            case 'firstName':
                return !formData.firstName ? 'Le prénom est requis' : '';
            case 'lastName':
                return !formData.lastName ? 'Le nom est requis' : '';
            case 'email':
                if (!formData.email) return 'L’adresse e-mail est requise';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Format d’e-mail invalide';
                return '';
            case 'password':
                if (!formData.password) return 'Le mot de passe est requis';
                if (!isPasswordValid) return 'Le mot de passe ne respecte pas les critères requis';
                return '';
            default:
                return '';
        }
    };

    const canSubmit = () => {
        return (
            formData.firstName &&
            formData.lastName &&
            formData.email &&
            isPasswordValid &&
            passwordsMatch &&
            !isLoading
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Marquer tous les champs comme visités
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            confirmPassword: true,
            role: true,
        });

        if (!canSubmit()) {
            setIsLoading(false);
            return;
        }

        try {
            formData.role = 'driver';
            formData.created_by = user.id;
            await register(formData);
            onClose();

            toast({
                title: 'Livreur crée aavec succès',
                description: 'Le nouveau livreur a été créer avec succès.',
            });
        } catch (error: any) {
            setError(error.response?.data?.message || 'Échec de l’inscription. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordRequirement = ({
        met,
        text
    }: {
        met: boolean;
        text: string
    }) => (
        <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
            {met ? (
                <CheckCircle size={16} className="flex-shrink-0" />
            ) : (
                <XCircle size={16} className="flex-shrink-0" />
            )}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* En-tête */}
                <div className="text-center">
                    <div className="flex justify-center mb-2">
                        <Button variant="ghost" onClick={onClose}>
                            <X className="mr-2 h-4 w-4" />
                            Fermer
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        <div className="bg-primary-500 p-3 rounded-2xl">
                            <Package className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold">
                        Créez votre compte un compte livreur
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Vous avez déjà un compte ?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-gray-400 hover:text-primary-500"
                        >
                            Connectez-vous ici
                        </Link>
                    </p>
                </div>

                {/* Formulaire */}
                <form className="mt-8 space-y-6 bg-card border p-8 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Champs de nom */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Prénom */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Prénom *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        onBlur={() => handleBlur('firstName')}
                                        className={`block w-full pl-10 pr-3 py-3 border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md ${getFieldError('firstName')
                                            ? 'border-red-300'
                                            : ''
                                            }`}
                                        placeholder="Entrez votre prénom"
                                    />
                                </div>
                                {getFieldError('firstName') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
                                )}
                            </div>

                            {/* Nom */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom *
                                </label>
                                <div className="relative">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        onBlur={() => handleBlur('lastName')}
                                        className={`block w-full pl-10 pr-3 py-3 border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md ${getFieldError('lastName')
                                            ? 'border-red-300'
                                            : ''
                                            }`}
                                        placeholder="Entrez votre nom"
                                    />
                                </div>
                                {getFieldError('lastName') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('lastName')}</p>
                                )}
                            </div>
                        </div>

                        {/* E-mail */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse e-mail *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    className={`block w-full pl-10 pr-3 py-3 border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md ${getFieldError('email')
                                        ? 'border-red-300'
                                        : ''
                                        }`}
                                    placeholder="Entrez votre adresse e-mail"
                                />
                            </div>
                            {getFieldError('email') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                            )}
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    className={`block w-full pl-10 pr-3 py-3 border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md ${getFieldError('password')
                                        ? 'border-red-300'
                                        : ''
                                        }`}
                                    placeholder="Créez un mot de passe"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {getFieldError('password') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                            )}

                            {/* Critères du mot de passe */}
                            {touched.password && (
                                <div className="mt-3 p-3 bg-background rounded-lg border">
                                    <p className="text-sm font-medium mb-2">Le mot de passe doit contenir :</p>
                                    <div className="space-y-1">
                                        <PasswordRequirement met={passwordValidation.hasMinLength} text="Au moins 8 caractères" />
                                        <PasswordRequirement met={passwordValidation.hasUpperCase} text="Une lettre majuscule" />
                                        <PasswordRequirement met={passwordValidation.hasLowerCase} text="Une lettre minuscule" />
                                        <PasswordRequirement met={passwordValidation.hasNumber} text="Un chiffre" />
                                        <PasswordRequirement met={passwordValidation.hasSpecialChar} text="Un caractère spécial" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`block w-full pl-10 pr-3 py-3 border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md ${!passwordsMatch && touched.confirmPassword
                                        ? 'border-red-300'
                                        : ''
                                        }`}
                                    placeholder="Confirmez votre mot de passe"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {touched.confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                            )}
                        </div>
                    </div>

                    {/* Conditions d'utilisation */}
                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                            J’accepte les{' '}
                            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                                conditions d’utilisation
                            </Link>{' '}
                            et la{' '}
                            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                                politique de confidentialité
                            </Link>
                        </label>
                    </div>

                    {/* Bouton de soumission */}
                    <div>
                        <Button type="submit" disabled={!canSubmit()} variant="hero" size="lg" className="hero-cta w-full">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Création du compte...
                                </div>
                            ) : (
                                'Créer un compte'
                            )}
                        </Button>
                    </div>

                    {/* Infos supplémentaires */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Le mot de passe doit contenir : au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

import { useDriverByAdmin } from '@/hooks/useDivers';
import { DeliveryStatus } from '@/types/delivery';
import { DeliveryCard } from '@/components/DeliveryCard';
import { toast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryStatusBadge } from '@/components/DeliveryStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const DriverGestion = () => {
    const { user } = useAuth();
    const { data: deliveries, isLoading } = useDriverByAdmin(user.id);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'online' | 'horline' | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'tracking'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

    const [showCreateDriver, setShowCreateDriver] = useState(false);

    // Filter and search deliveries
    const filteredDeliveries = useMemo(() => {
        if (!deliveries || deliveries?.length < 0 || isLoading) return [];

        let filtered = deliveries.filter((delivery) => {
            const matchesSearch =
                delivery.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.email.toLowerCase().includes(searchTerm.toLowerCase())



            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'online' && user.isActive === true) ||
                (statusFilter === 'horline' && user.isActive === false);

            return matchesSearch && matchesStatus;
        });

        // Sort deliveries
        /* filtered.sort((a, b) => {
             let aValue: any, bValue: any;
 
             switch (sortBy) {
                 case 'date':
                     aValue = new Date(a.createdAt[0]?.timestamp || a.estimatedDelivery);
                     bValue = new Date(b.timeline[0]?.timestamp || b.estimatedDelivery);
                     break;
                 case 'status':
                     aValue = a.status;
                     bValue = b.status;
                     break;
                 case 'tracking':
                     aValue = a.trackingNumber;
                     bValue = b.trackingNumber;
                     break;
                 default:
                     return 0;
             }
 
             if (sortOrder === 'asc') {
                 return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
             } else {
                 return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
             }
         });*/

        return filtered;
    }, [deliveries, searchTerm, statusFilter, sortBy, sortOrder]);

    const handleDeleteDelivery = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this delivery?')) {
            //
        }
    };

    /*const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortBy('date');
        setSortOrder('desc');
    };*/

    const exportToCSV = () => {
        if (!filteredDeliveries.length) return;

        const headers = [
            'Tracking Number',
            'Status',
            'Sender',
            'Recipient',
            'Package Description',
            'Weight',
            'Dimensions',
            'Estimated Delivery',
            'Current Location'
        ];

        const csvData = filteredDeliveries.map(delivery => [
            delivery.email,
            delivery.firstName,
            delivery.lastName,
            delivery.isActive,
            delivery.role,
            new Date(delivery.lastLogin).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `deliveries-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };


    return (

        <AdminLayout>
            <div className="min-h-screen bg-gray-50 py-8  bg-muted/30" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className='flex justify-between'>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Gestion des livreurs</h2>
                            <p className="text-muted-foreground">Gérez et suivez toutes vos livreur</p>
                                <p className="text-gray-600 mt-2">
                                    {filteredDeliveries.length} Driver{filteredDeliveries.length !== 1 ? 's' : ''} found
                                </p>
                        </div>
                        <div className='flex gap-3'>
                            <button disabled={!filteredDeliveries.length} className='disabled:cursor-not-allowed'>
                                <Button
                                    type="submit" variant="hero" size="lg"
                                    className="hero-cta disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={exportToCSV}
                                    disabled={!filteredDeliveries.length}
                                >
                                    <Download className="mr-2 h-5 w-5 " />
                                    <span className='hidden md:inline'>Exporter CSV</span>
                                </Button>
                            </button>
                            <button >
                                <Button
                                    type="submit" variant="hero" size="lg"
                                    className="hero-cta"
                                    onClick={() => setShowCreateDriver(true)}
                                >
                                    <Plus className="mr-2 h-5 w-5 " />
                                    <span className='hidden md:inline'>Nouveau livreur </span>
                                </Button>
                            </button>
                        </div>
                    </div>


                    {user?.role === 'driver' && (
                        <div>
                            <h1>Driver App</h1>
                            <p>Sending GPS...</p>
                        </div>
                    )}



                    {showCreateDriver && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <Register onClose={() => setShowCreateDriver(false)} />
                        </div>
                    )}


                    {/* Search and Filters 
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {/* Search 
                            <div className="lg:col-span-2">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Driver
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Search by tracking number, recipient, sender, or package..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </div>



                            {/* Status Filter 
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'online' | 'horline' | 'all')}
                                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="online">en ligne</option>
                                    <option value="horline">hors ligne</option>
                                </select>
                            </div>

                            {/* Sort 
                            <div>
                                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    id="sort"
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [newSortBy, newSortOrder] = e.target.value.split('-');
                                        setSortBy(newSortBy as 'date' | 'status' | 'tracking');
                                        setSortOrder(newSortOrder as 'asc' | 'desc');
                                    }}
                                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 rounded-md"
                                >
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="status-asc">Status (A-Z)</option>
                                    <option value="status-desc">Status (Z-A)</option>
                                    <option value="tracking-asc">Tracking # (A-Z)</option>
                                    <option value="tracking-desc">Tracking # (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </div>*/}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rechercher une livreur</CardTitle>
                        </CardHeader>
                        <CardContent className='md:flex justify-between gap-4 '>
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par numéro ou nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />

                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 bottom-5 pr-3 flex items-center"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            <div className='md:flex gap-3 relative md:-top-6'>
                                {/* Status Filter */}
                                <div >
                                    <label htmlFor="status" className="block text-muted-foreground">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as 'online' | 'horline' | 'all')}
                                        className="block w-full md:w-auto px-auto p-2 text-base border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-500 rounded-md"
                                    >
                                        <option value="all">Tous</option>
                                        <option value="online">en ligne</option>
                                        <option value="horline">hors ligne</option>
                                    </select>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                    <div className='py-2'></div>
                    <Card>
                        {filteredDeliveries && filteredDeliveries.length > 0 ? (
                            <div>

                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead className="border-b bg-muted/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Id°</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Prenom</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">En ligne le</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {filteredDeliveries.map((delivery) =>
                                                        <tr key={delivery.id} className="border-b hover:bg-muted/50 cursor-pointer">
                                                            <td className="px-4 py-3 font-medium " >{delivery.id}</td>
                                                            <td className="px-4 py-3">{delivery.firstName}</td>
                                                            <td className="px-4 py-3">{delivery.lastName}</td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">{delivery.email}</td>
                                                            <td className="px-4 py-3 text-sm">{delivery.role}</td>
                                                            <td className="px-4 py-3">
                                                                {delivery.isActive}
                                                                <Badge variant={delivery.isActive ? 'success' : 'secondary'}>{delivery.isActive ? <span className='text-green-400'>en ligne ⦁</span> : <span className='text-gray-400'>hors ligne ⦁</span>}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">{delivery.role}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {new Date(delivery.lastLogin).toLocaleDateString('fr-FR')}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : isLoading ? (
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <h2>No deliveries assigned to Drivers.</h2>
                        )}
                    </Card>

                </div>

            </div>
        </AdminLayout>
    );
};
