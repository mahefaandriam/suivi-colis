import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getDeliveryByTrackingNumber } from '@/data/mockData';

const Index = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un numéro de suivi',
        variant: 'destructive',
      });
      return;
    }

    const delivery = getDeliveryByTrackingNumber(trackingNumber);
    if (delivery) {
      navigate(`/tracking/${delivery.id}`);
    } else {
      toast({
        title: 'Colis non trouvé',
        description: 'Aucun colis trouvé avec ce numéro de suivi',
        variant: 'destructive',
      });
    }
  };

  const features = [
    {
      icon: Package,
      title: 'Suivi en temps réel',
      description: 'Suivez votre colis à chaque étape de sa livraison',
    },
    {
      icon: Truck,
      title: 'Livraison rapide',
      description: 'Livraison en 24-48h partout en France',
    },
    {
      icon: CheckCircle,
      title: 'Fiabilité garantie',
      description: '99% de nos colis sont livrés à temps',
    },
    {
      icon: Clock,
      title: 'Support 24/7',
      description: 'Notre équipe est disponible pour vous aider',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4" style={{
        background: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(262, 70%, 45%) 50%, hsl(280, 80%, 35%) 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 15s ease infinite'
      }}>
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-3xl" style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 70%)',
            animation: 'float 8s ease-in-out infinite, pulse-glow 4s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl" style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, rgba(196, 181, 253, 0) 70%)',
            animation: 'float 7s ease-in-out infinite'
          }} />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="mb-4 text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
            Suivez vos livraisons en temps réel
          </h1>
          <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
            Entrez votre numéro de suivi pour connaître l'emplacement exact de votre colis
          </p>

          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <Card className="shadow-glow border-primary-glow/20">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="text"
                    placeholder="Entrez votre numéro de suivi (ex: TRK123456789)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="hero" size="lg">
                    <Search className="mr-2 h-5 w-5" />
                    Suivre
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
            >
              Accès administrateur
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Pourquoi nous choisir ?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 TrackExpress. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
