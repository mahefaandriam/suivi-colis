// src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Package,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { RegisterData } from '../types/auth';
import { Button } from '@/components/ui/button';

interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const Register = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
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
    });

    if (!canSubmit()) {
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      // Redirection vers la page de connexion avec message de succès
      navigate('/login', {
        state: {
          message: 'Inscription réussie ! Veuillez vous connecter à votre compte.'
        }
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
            <Button variant="ghost" onClick={() => navigate('/login')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="bg-primary-500 p-3 rounded-2xl">
              <Package className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold">
            Créez votre compte
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
