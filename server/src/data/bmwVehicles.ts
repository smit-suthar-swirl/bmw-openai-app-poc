import type { BMWVehicle } from '@bmw-ai/shared';

export const BMW_VEHICLES: BMWVehicle[] = [
  {
    id: 'bmw-m4-competition',
    name: 'BMW M4 Competition',
    type: 'Coupe',
    price: 84900,
    range: null,
    horsepower: 503,
    acceleration: 3.8,
    seating: 4,
    description:
      'The BMW M4 Competition is the ultimate expression of BMW M performance. With a twin-turbocharged inline-6 engine producing 503 hp, it delivers supercar-level performance wrapped in a stunning coupe body.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/M/2024-M4/bmw-2024-m4-coupe-overview.jpg',
    features: [
      'M TwinPower Turbo 3.0L inline-6',
      'M Steptronic 8-speed automatic',
      'M Sport differential',
      'Adaptive M suspension',
      'M Carbon ceramic brakes (optional)',
      'M Drive Professional',
      'Harman Kardon surround sound',
      'Head-up display',
    ],
    isElectric: false,
    tags: ['performance', 'sports', 'coupe', 'manual', 'track'],
  },
  {
    id: 'bmw-i7-xdrive60',
    name: 'BMW i7 xDrive60',
    type: 'EV',
    price: 119300,
    range: 625,
    horsepower: 536,
    acceleration: 4.5,
    seating: 5,
    description:
      'The BMW i7 xDrive60 redefines electric luxury. The flagship BMW sedan now comes fully electric, offering 625 km of range, a theatre-inspired rear cabin, and unmatched digital sophistication.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/7Series/2024-i7/bmw-2024-i7-overview.jpg',
    features: [
      '101.7 kWh lithium-ion battery',
      'Dual electric motors (all-wheel drive)',
      'Executive Lounge rear seating',
      '31.3" BMW Theatre Screen (rear)',
      'Sky Lounge panoramic roof',
      'B&W Diamond surround sound',
      'Level 2 automated driving',
      'Massaging seats (4-zone)',
    ],
    isElectric: true,
    tags: ['electric', 'luxury', 'sedan', 'ev', 'flagship', 'long-range'],
  },
  {
    id: 'bmw-x5-xdrive40i',
    name: 'BMW X5 xDrive40i',
    type: 'SUV',
    price: 66900,
    range: null,
    horsepower: 335,
    acceleration: 5.3,
    seating: 7,
    description:
      'The BMW X5 is the SUV that started it all. Combining athletic performance with luxurious versatility, the X5 remains the benchmark for premium mid-size SUVs with available 3rd-row seating.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/X/2024-X5/bmw-2024-x5-overview.jpg',
    features: [
      'TwinPower Turbo 3.0L inline-6',
      'xDrive intelligent AWD',
      'Adaptive air suspension',
      'Optional 3rd-row seating',
      'Panoramic Sky Lounge roof',
      'BMW Live Cockpit Professional',
      'Harman Kardon surround sound',
      'Gesture control',
    ],
    isElectric: false,
    tags: ['suv', 'family', 'awd', 'luxury', 'versatile', 'practical'],
  },
  {
    id: 'bmw-xm',
    name: 'BMW XM',
    type: 'SUV',
    price: 159000,
    range: 80,
    horsepower: 644,
    acceleration: 4.1,
    seating: 5,
    description:
      'The BMW XM is the most powerful production BMW M vehicle ever built. A plug-in hybrid SUV with 644 hp, it blurs the line between luxury SUV and supercar. Bold, unapologetic design.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/XM/2024-XM/bmw-2024-xm-overview.jpg',
    features: [
      'M Hybrid V8 twin-turbo 4.4L',
      '25.7 kWh high-voltage battery',
      '80 km electric-only range',
      'M Sport Pro exhaust',
      'Iconic Glow exterior lighting',
      'Sofina Nappa leather',
      'Bowers & Wilkins Diamond sound',
      'M-specific chassis control',
    ],
    isElectric: false,
    tags: ['suv', 'hybrid', 'phev', 'performance', 'luxury', 'flagship', 'powerful'],
  },
  {
    id: 'bmw-i4-m50',
    name: 'BMW i4 M50',
    type: 'EV',
    price: 75800,
    range: 520,
    horsepower: 536,
    acceleration: 3.9,
    seating: 5,
    description:
      'The BMW i4 M50 is the electric gran coupe that proves EVs can be thrilling. With 536 hp from dual motors, 520 km range, and M Sport tuning, it delivers the ultimate electric driving experience.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/4Series/2024-i4/bmw-2024-i4-overview.jpg',
    features: [
      '83.9 kWh lithium-ion battery',
      'Dual electric motors (M xDrive)',
      'M Sport suspension tuning',
      'M Sport brakes',
      'BMW Curved Display (14.9")',
      'Live Cockpit Professional',
      'Harman Kardon sound system',
      'Up to 205 kW DC fast charging',
    ],
    isElectric: true,
    tags: ['electric', 'performance', 'sedan', 'ev', 'sports', 'm-sport'],
  },
  {
    id: 'bmw-x3-xdrive30i',
    name: 'BMW X3 xDrive30i',
    type: 'SUV',
    price: 48200,
    range: null,
    horsepower: 248,
    acceleration: 6.2,
    seating: 5,
    description:
      'The BMW X3 is the perfect entry point into BMW SAV ownership. Offering a premium driving experience, practical interior, and BMW\'s renowned driving dynamics in a compact SUV package.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/X/2024-X3/bmw-2024-x3-overview.jpg',
    features: [
      'TwinPower Turbo 2.0L 4-cylinder',
      'xDrive intelligent AWD',
      'Sport automatic transmission',
      'Panoramic moonroof',
      'BMW Live Cockpit Plus',
      'Driving Assistant',
      'Wireless Apple CarPlay & Android Auto',
      'Heated front seats',
    ],
    isElectric: false,
    tags: ['suv', 'compact', 'practical', 'awd', 'entry-luxury', 'family'],
  },
  {
    id: 'bmw-5-series-540i',
    name: 'BMW 5 Series 540i',
    type: 'Sedan',
    price: 62500,
    range: null,
    horsepower: 375,
    acceleration: 4.6,
    seating: 5,
    description:
      'The all-new BMW 5 Series continues its legacy as the definitive executive sedan. With a refined turbocharged inline-6, cutting-edge technology, and elegant design, it sets the standard in its class.',
    image: 'https://bmwusa.com/content/dam/bmwusa/Models/5Series/2024-540i/bmw-2024-540i-overview.jpg',
    features: [
      'TwinPower Turbo 3.0L inline-6',
      'xDrive all-wheel drive',
      '8-speed Sport automatic',
      'Integral active steering',
      'BMW Curved Display (12.3" + 14.9")',
      'Augmented Reality Navigation',
      'Harman Kardon surround sound',
      'Panoramic Sky Lounge roof',
    ],
    isElectric: false,
    tags: ['sedan', 'executive', 'luxury', 'awd', 'business', 'comfortable'],
  },
];

export function getVehicleById(id: string): BMWVehicle | undefined {
  return BMW_VEHICLES.find((v) => v.id === id);
}

export function getVehicleByName(name: string): BMWVehicle | undefined {
  const normalized = name.toLowerCase().trim();
  return BMW_VEHICLES.find(
    (v) =>
      v.name.toLowerCase().includes(normalized) ||
      v.id.toLowerCase().includes(normalized) ||
      normalized.includes(v.name.toLowerCase().split(' ').pop() || '')
  );
}
