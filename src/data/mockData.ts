import { Delivery, DeliveryStats } from '@/types/delivery';

export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    trackingNumber: 'TRK123456789',
    status: 'in_transit',
    sender: {
      name: 'Boutique Mode Paris',
      address: '15 Rue de Rivoli, 75001 Paris',
    },
    recipient: {
      name: 'Marie Dubois',
      address: '42 Avenue des Champs-Élysées, 75008 Paris',
      phone: '+33 6 12 34 56 78',
    },
    package: {
      weight: 2.5,
      dimensions: '30x20x15 cm',
      description: 'Vêtements',
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        location: 'Paris Centre de Tri',
        timestamp: '2024-01-15T08:00:00',
        description: 'Colis reçu au centre de tri',
      },
      {
        id: '2',
        status: 'in_transit',
        location: 'En route vers Paris 8ème',
        timestamp: '2024-01-15T14:30:00',
        description: 'Colis en cours de livraison',
      },
    ],
    estimatedDelivery: '2024-01-16T16:00:00',
    currentLocation: 'Camion de livraison - Paris 8ème',
  },
  {
    id: '2',
    trackingNumber: 'TRK987654321',
    status: 'delivered',
    sender: {
      name: 'TechStore Lyon',
      address: '8 Place Bellecour, 69002 Lyon',
    },
    recipient: {
      name: 'Pierre Martin',
      address: '23 Rue de la République, 69001 Lyon',
      phone: '+33 6 98 76 54 32',
    },
    package: {
      weight: 1.2,
      dimensions: '25x15x10 cm',
      description: 'Électronique',
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        location: 'Lyon Centre de Tri',
        timestamp: '2024-01-10T09:00:00',
        description: 'Colis reçu',
      },
      {
        id: '2',
        status: 'in_transit',
        location: 'En route',
        timestamp: '2024-01-10T15:00:00',
        description: 'Colis en transit',
      },
      {
        id: '3',
        status: 'out_for_delivery',
        location: 'Lyon 1er',
        timestamp: '2024-01-11T08:00:00',
        description: 'En cours de livraison',
      },
      {
        id: '4',
        status: 'delivered',
        location: '23 Rue de la République',
        timestamp: '2024-01-11T14:22:00',
        description: 'Colis livré - Signé par Pierre Martin',
      },
    ],
    estimatedDelivery: '2024-01-11T16:00:00',
  },
  {
    id: '3',
    trackingNumber: 'TRK456789123',
    status: 'pending',
    sender: {
      name: 'Librairie Marseille',
      address: '56 La Canebière, 13001 Marseille',
    },
    recipient: {
      name: 'Sophie Leblanc',
      address: '78 Boulevard Longchamp, 13001 Marseille',
      phone: '+33 6 45 67 89 12',
    },
    package: {
      weight: 3.8,
      dimensions: '35x25x20 cm',
      description: 'Livres',
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        location: 'Marseille Centre de Tri',
        timestamp: '2024-01-16T07:00:00',
        description: 'Colis en attente de traitement',
      },
    ],
    estimatedDelivery: '2024-01-18T16:00:00',
    currentLocation: 'Centre de tri Marseille',
  },
  {
    id: '4',
    trackingNumber: 'TRK321654987',
    status: 'out_for_delivery',
    sender: {
      name: 'GourmetFood Toulouse',
      address: '12 Place du Capitole, 31000 Toulouse',
    },
    recipient: {
      name: 'Lucas Bernard',
      address: '34 Rue Alsace Lorraine, 31000 Toulouse',
      phone: '+33 6 23 45 67 89',
    },
    package: {
      weight: 5.2,
      dimensions: '40x30x25 cm',
      description: 'Produits alimentaires',
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        location: 'Toulouse Centre',
        timestamp: '2024-01-16T06:00:00',
        description: 'Colis reçu',
      },
      {
        id: '2',
        status: 'in_transit',
        location: 'En préparation',
        timestamp: '2024-01-16T09:00:00',
        description: 'Colis en préparation',
      },
      {
        id: '3',
        status: 'out_for_delivery',
        location: 'Camion de livraison',
        timestamp: '2024-01-16T11:30:00',
        description: 'Votre colis est en cours de livraison',
      },
    ],
    estimatedDelivery: '2024-01-16T15:00:00',
    currentLocation: 'À 2 arrêts de votre adresse',
  },
  {
    id: '5',
    trackingNumber: 'TRK789456123',
    status: 'failed',
    sender: {
      name: 'Fleuriste Nice',
      address: '90 Promenade des Anglais, 06000 Nice',
    },
    recipient: {
      name: 'Emma Rousseau',
      address: '67 Avenue Jean Médecin, 06000 Nice',
      phone: '+33 6 87 65 43 21',
    },
    package: {
      weight: 1.5,
      dimensions: '20x20x30 cm',
      description: 'Fleurs',
    },
    timeline: [
      {
        id: '1',
        status: 'pending',
        location: 'Nice Centre',
        timestamp: '2024-01-15T08:00:00',
        description: 'Colis reçu',
      },
      {
        id: '2',
        status: 'in_transit',
        location: 'En route',
        timestamp: '2024-01-15T10:00:00',
        description: 'En cours de livraison',
      },
      {
        id: '3',
        status: 'out_for_delivery',
        location: 'Nice Centre',
        timestamp: '2024-01-15T13:00:00',
        description: 'Tentative de livraison',
      },
      {
        id: '4',
        status: 'failed',
        location: '67 Avenue Jean Médecin',
        timestamp: '2024-01-15T14:30:00',
        description: 'Destinataire absent - Avis de passage laissé',
      },
    ],
    estimatedDelivery: '2024-01-15T16:00:00',
    currentLocation: 'Point relais - À récupérer',
  },
];

export const mockStats: DeliveryStats = {
  total: 5,
  delivered: 1,
  inTransit: 1,
  pending: 1,
  failed: 1,
};

export const getDeliveryById = (id: string): Delivery | undefined => {
  return mockDeliveries.find(d => d.id === id);
};

export const getDeliveryByTrackingNumber = (trackingNumber: string): Delivery | undefined => {
  return mockDeliveries.find(d => d.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
};
