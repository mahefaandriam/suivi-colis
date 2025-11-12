export const mockDrivers = [
  {
    id: 'driver-1',
    name: 'Jean Dupont',
    vehicle: 'Van - AB-123-CD',
    location: [48.8566, 2.3522],
    lastUpdate: new Date()
  },
  {
    id: 'driver-2',
    name: 'Marie Martin',
    vehicle: 'Car - EF-456-GH',
    location: [48.8606, 2.3376],
    lastUpdate: new Date()
  },
  {
    id: 'driver-3',
    name: 'Pierre Leroy',
    vehicle: 'Motorcycle - IJ-789-KL',
    location: [48.8526, 2.3662],
    lastUpdate: new Date()
  }
];

export const mockDeliveries = [
  {
    id: 'DEL-001',
    recipient: 'Alice Johnson',
    destinationAddress: '123 Champs-Élysées, Paris',
    destination: [48.8738, 2.2950],
    pickup: [48.8566, 2.3522],
    packageType: 'Electronics',
    status: 'assigned',
    driverId: 'driver-1',
    createdAt: new Date('2024-01-15T08:00:00')
  },
  {
    id: 'DEL-002',
    recipient: 'Bob Smith',
    destinationAddress: '45 Rue de Rivoli, Paris',
    destination: [48.8575, 2.3514],
    pickup: [48.8606, 2.3376],
    packageType: 'Documents',
    status: 'in_transit',
    driverId: 'driver-2',
    createdAt: new Date('2024-01-15T09:30:00')
  },
  {
    id: 'DEL-003',
    recipient: 'Carol Davis',
    destinationAddress: '78 Boulevard Saint-Germain, Paris',
    destination: [48.8522, 2.3329],
    pickup: [48.8526, 2.3662],
    packageType: 'Food',
    status: 'picked_up',
    driverId: 'driver-3',
    createdAt: new Date('2024-01-15T10:15:00')
  },
  {
    id: 'DEL-004',
    recipient: 'David Wilson',
    destinationAddress: '12 Avenue Montaigne, Paris',
    destination: [48.8681, 2.3036],
    pickup: [48.8566, 2.3522],
    packageType: 'Clothing',
    status: 'pending',
    driverId: null,
    createdAt: new Date('2024-01-15T11:00:00')
  }
];